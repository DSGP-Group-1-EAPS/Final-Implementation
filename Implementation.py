# Importing the required libraries
from io import BytesIO
from flask import Flask, request
import pandas as pd
from flask_cors import CORS
from RandomForestClassificationModel import get_features, predict
from SARIMA_Model import get_time_series_forecast, add_to_dataset
from flask import jsonify
from S3Connection import get_s3_access, upload_file_to_s3, get_model, download_dataset, upload_model_to_s3
from Preprocessing import feature_engineering, remove_features, get_last_month

# Creating a Flask app
app = Flask(__name__)
CORS(app)

data = None
server_status = "Processing"

rf_selected_features = ['Encoded Code', 'Encoded Department', 'YearsWorked', 'DayOfWeek',
                        'LeaveMonth', 'LeaveYear', 'Encoded Reason', 'Encoded Status',
                        'Encoded Absenteeism Type', 'Encoded Shift', 'MonthlyDeptTotal']


# Define the main route
@app.route('/', methods=['POST'])
def main():
    global data, updated_df
    global server_status

    # Define the months to get the month name
    months = {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'
    }

    # Check if the request contains a file
    if 'file' not in request.files:
        return 'No file uploaded', 400

    file = request.files['file']

    if file.filename == '':
        return 'No file selected', 400

    try:
        df = pd.read_excel(file)
    except Exception as e:
        return f'Error reading Excel file: {e}', 400

    server_status = "File Uploaded"

    # Get the month name and the predicted month name
    predicted_month_name = months[df['LeaveMonth'][0] + 1]
    month_name = months[df['LeaveMonth'][0]]

    year = df['LeaveYear'][0]
    month = df['LeaveMonth'][0]

    if month == 12:
        predicted_next_year = year + 1
    else:
        predicted_next_year = year

    server_status = "Connecting to S3"
    # Read the AWS credentials from a file
    def read_aws_config(filename):
        aws_config = {}
        with open(filename, 'r') as file:
            for line in file:
                key, value = line.strip().split('=')
                aws_config[key.strip()] = value.strip()
        return aws_config

    config = read_aws_config('s3config.txt')
    access_key = config['ACCESS_KEY']
    secret_key = config['SECRET_KEY']

    access_key = str(access_key)
    secret_key = str(secret_key)

    # Creating a Boto3 client to connect to S3
    s3 = get_s3_access(access_key, secret_key, 'ap-south-1')

    server_status = "Loading Data"

    monthly_dept_total_buffer = BytesIO()
    monthly_dept_total = download_dataset('Datasets/cleaned_Monthly_Dept_Total.xlsx', s3, 'eapss3',
                                          monthly_dept_total_buffer)

    training_df_buffer = BytesIO()
    training_df = download_dataset('Datasets/Training Dataset/training_dataset_original.xlsx', s3, 'eapss3',
                                   training_df_buffer)

    prev_month_data_buffer = BytesIO()
    prev_month_data = download_dataset('Datasets/Training Dataset/prev_monthly_data.xlsx', s3, 'eapss3',
                                       prev_month_data_buffer)

    updated_training_df = remove_features(training_df)
    combined_df = pd.concat([updated_training_df, prev_month_data, df])

    preprocessed_retraining_df = feature_engineering(combined_df, monthly_dept_total)
    preprocessed_retraining_df = preprocessed_retraining_df[
        preprocessed_retraining_df['Date'] < f'2023-{get_last_month(preprocessed_retraining_df)}-01']

    # ACTUAL DATA
    prevs_month_actual = preprocessed_retraining_df[
        preprocessed_retraining_df['Date'] >= f'2023-{get_last_month(preprocessed_retraining_df)}-01']
    prevs_month_actual.head()

    prevs_month_actual_b = prevs_month_actual[prevs_month_actual['TargetCategory'] == 'B']
    prevs_month_actual_b.head()

    prev_actual_emp_codes = prevs_month_actual_b['Encoded Code'].unique()
    print(prev_actual_emp_codes)
    print(len(prev_actual_emp_codes))

    # Previous data
    last_record = prevs_month_actual_b.iloc[-1]
    # prev_leave_year = prevs_month_actual_b['LeaveYear'][-1]
    prev_leave_year = last_record['LeaveYear']

    print(prev_leave_year)
    # prev_leave_month = prevs_month_actual_b['LeaveMonth'][-1]
    prev_leave_month = last_record['LeaveMonth']
    print(prev_leave_month)

    accuracy_model=0
    prev_month_data_predict_buffer = BytesIO()
    try:
        prevs_month_predict = download_dataset(f'Datasets/Predictions/{prev_leave_year}-{prev_leave_month}.xlsx',
                                               s3, 'eapss3', prev_month_data_predict_buffer)
        prev_predict_emp_codes = prevs_month_predict['Employee Code'].tolist()
        print(prev_predict_emp_codes)
        print(len(prev_predict_emp_codes))
        count = 0
        for emp_code in prev_predict_emp_codes:
            if emp_code in prev_actual_emp_codes:
                count += 1
                print(emp_code)

        print(count)
        accuracy_model = count / len(prev_predict_emp_codes) * 100
        accuracy_model = round(accuracy_model, 2)
        print("Accuracy comparison:", accuracy_model)

    except Exception as e:
        print("An error occurred while retrieving prev_predict_emp_codes:", e)

    print(preprocessed_retraining_df.shape)
    server_status = "Data cleaned & preprocessed"

    X_retrain = preprocessed_retraining_df[rf_selected_features]
    Y_retrain = preprocessed_retraining_df['TargetCategory']

    server_status = "Loading models"

    rf_model_buffer = BytesIO()
    rf_model = get_model(s3, 'eapss3', 'Models/rf_model_original.pkl', rf_model_buffer)

    cb_model_buffer = BytesIO()
    cb_model = get_model(s3, 'eapss3', 'Models/Catboost_model_original.pkl', cb_model_buffer)

    lgbm_model_buffer = BytesIO()
    lgbm_model = get_model(s3, 'eapss3', 'Models/LightGBM_model_original.pkl', lgbm_model_buffer)
    X_retrain.head()

    server_status = "Retraining models"


    rf_model.fit(X_retrain, Y_retrain)
    cb_model.fit(X_retrain, Y_retrain)
    lgbm_model.fit(X_retrain, Y_retrain)

    upload_file_to_s3(preprocessed_retraining_df, 'eapss3',
                      'Datasets/Training Dataset/updated_training_dataset.xlsx')

    upload_file_to_s3(df, 'eapss3', 'Datasets/Training Dataset/prev_monthly_data_updated.xlsx')

    server_status = "Loading & getting forecast from Time Series Models"

    sewing_model_buffer = BytesIO()
    sewing_model = get_model(s3, 'eapss3', 'Models/Sewing_sarimax.pkl', sewing_model_buffer)

    mat_model_buffer = BytesIO()
    mat_model = get_model(s3, 'eapss3', 'Models/Mat_sarimax.pkl', mat_model_buffer)

    jumper_model_buffer = BytesIO()
    jumper_model = get_model(s3, 'eapss3', 'Models/Jumper_sarimax.pkl', jumper_model_buffer)

    sewing_forecast = get_time_series_forecast(sewing_model, 3)
    mat_forecast = get_time_series_forecast(mat_model, 3)
    jumper_forecast = get_time_series_forecast(jumper_model, 3)

    server_status = "Adding forecasted values to dataset"

    if df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 9:
        updated_df = add_to_dataset(df, sewing_forecast[22], mat_forecast[22], jumper_forecast[22])
    elif df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 10:
        updated_df = add_to_dataset(df, sewing_forecast[23], mat_forecast[23], jumper_forecast[23])
    elif df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 11:
        updated_df = add_to_dataset(df, sewing_forecast[24], mat_forecast[24], jumper_forecast[24])

    df_selected = get_features(updated_df, rf_selected_features)
    print(df_selected.shape)

    server_status = "Making Predictions"
    rf_pred = predict(rf_model, df_selected)
    cb_pred = predict(cb_model, df_selected)
    lgbm_pred = predict(lgbm_model, df_selected)

    server_status = "Calculating probabilities"

    rf_pred_proba = rf_model.predict_proba(df_selected)
    cb_pred_proba = cb_model.predict_proba(df_selected)
    lgbm_pred_proba = lgbm_model.predict_proba(df_selected)

    # Create a DataFrame with predictions from each model and their probabilities
    predictions_df = pd.DataFrame({
        'Employee Code': df_selected['Encoded Code'],
        'Department': df_selected['Encoded Department'],
        'RF_Pred': rf_pred,
        'RF_Proba': rf_pred_proba.max(axis=1),  # Taking the maximum probability across all classes
        'CatBoost_Pred': cb_pred,
        'CatBoost_Proba': cb_pred_proba.max(axis=1),  # Taking the maximum probability across all classes
        'LGBM_Pred': lgbm_pred,
        'LGBM_Proba': lgbm_pred_proba.max(axis=1)  # Taking the maximum probability across all classes
    })

    # Determine the majority vote for each row
    predictions_df['Majority_Vote'] = predictions_df.mode(axis=1)[0]

    # Calculate the mean probability for each majority vote
    mean_proba = []
    for index, row in predictions_df.iterrows():
        proba_sum = 0
        count = 0
        for model in ['RF', 'CatBoost', 'LGBM']:
            if row[model + '_Pred'] == row['Majority_Vote']:
                proba_sum += row[model + '_Proba']
                count += 1
        mean_proba.append(proba_sum / count if count > 0 else 0)

    # Add the mean probability column to the predictions DataFrame
    predictions_df['Mean_Proba'] = mean_proba
    # employee_codes, departments, probabilities = get_high_prob_employee_info(rf_model, df_selected, predictions)

    server_status = "Filtering predictions"

    filtered_df = predictions_df[(predictions_df['Majority_Vote'] == 'B') & (predictions_df['Mean_Proba'] > 0.70)]

    # Drop duplicate rows based on the 'Employee_Code' column to keep only unique employee codes
    filtered_df_unique = filtered_df.drop_duplicates(subset=['Employee Code'])
    print("Number of rows in filtered DataFrame:", filtered_df_unique.shape[0])

    server_status = "Uploading retrained models to S3"

    upload_model_to_s3(rf_model, 'eapss3', 'Models/rf_model_updated.pkl')
    print("RF model uploaded to S3")

    upload_model_to_s3(cb_model, 'eapss3', 'Models/Catboost_model_updated.pkl')
    print("CatBoost model uploaded to S3")

    upload_model_to_s3(lgbm_model, 'eapss3', 'Models/LightGBM_model_updated.pkl')
    print("LGBM model uploaded to S3")

    upload_file_to_s3(filtered_df_unique, 'eapss3',
                      f"Datasets/Predictions/{df_selected['LeaveYear'][0]}-{df_selected['LeaveMonth'][0]}.xlsx")

    # Create a dictionary with the data
    data = {
        'lmpa': [accuracy_model],
        'month name': (month_name, predicted_next_year),
        'predicted month name': (predicted_month_name, predicted_next_year),
        'employee_codes': filtered_df_unique['Employee Code'].tolist(),
        'departments': filtered_df_unique['Department'].tolist(),
        'probabilities': filtered_df_unique['Mean_Proba'].tolist()
        # 'majority votes': filtered_df_unique['Majority_Vote'].tolist()
    }

    print(data)
    server_status = "Done"

    # Return the data as JSON
    return "Done"


@app.route('/data')
def get_data():
    data = {
        'lmpa': [69],
        'employee_codes': [2278, 393, 4102, 1965, 1820, 1276, 2818, 1602, 243, 2306, 2766, 3305, 320, 2474, 194, 4036,
                           2423, 4032, 3895, 3890, 2365, 2830, 1072, 3308, 3984, 1316, 2976, 729, 4096, 2152, 1442,
                           3771],
        'departments': [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2],
        'probabilities': [0.8235946860541531, 0.7220389012594436, 0.8709247978728859, 0.8274388992349831,
                          0.8284207062015673, 0.7537164492301901, 0.8890992019760476, 0.8429063033729193,
                          0.8125052865108341, 0.7700538058252654, 0.7664137895119737, 0.8300954933374678,
                          0.8025734534127148, 0.832772466572902, 0.8212819013423176, 0.913070840422756,
                          0.8422674834454722, 0.913070840422756, 0.907251090059841, 0.9062814563662628,
                          0.7254290202396856, 0.8499682022175709, 0.7185136268723893, 0.7694244345341166,
                          0.7839375310055953, 0.7246816120865183, 0.7064476391168176, 0.7547719587083508,
                          0.7292411673152369, 0.8494465552449885, 0.7995627327146254, 0.7737517607724013]
    }

    return jsonify(data)


@app.route('/status')
def get_server_status():
    global server_status  # Access the global variable within the function
    print("Server Status : ", server_status)
    return server_status


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
