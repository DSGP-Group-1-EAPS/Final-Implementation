from io import BytesIO

from flask import Flask, render_template, request
import pandas as pd
from RandomForestClassificationModel import rf_load_model, get_features, predict, get_high_prob_employee_info
from SARIMA_Model import get_time_series_forecast, add_to_dataset, ts_load_model
from flask import jsonify
from S3Connection import get_s3_access, upload_file_to_s3, get_model, download_dataset, upload_model_to_s3
from Preprocessing import feature_engineering, remove_features, get_last_month

app = Flask(__name__, template_folder='Templates')

rf_selected_features = ['Encoded Code', 'Encoded Department', 'YearsWorked', 'DayOfWeek',
                        'LeaveMonth', 'LeaveYear', 'Encoded Reason', 'Encoded Status',
                        'Encoded Absenteeism Type', 'Encoded Shift', 'MonthlyDeptTotal']
updated_df = pd.DataFrame()


# final

@app.route('/')
def index():
    return render_template('Main.html')


@app.route('/EAPSPage', methods=['GET', 'POST'])
def main():
    global updated_df, X_retrain, Y_retrain
    if request.method == 'GET':
        return render_template('EAPSPage.html')

    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file uploaded', 400

        file = request.files['file']

        if file.filename == '':
            return 'No file selected', 400

        try:
            df = pd.read_excel(file)
        except Exception as e:
            return f'Error reading Excel file: {e}', 400

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

        monthly_dept_total = pd.read_excel('Datasets/cleaned_Monthly_Dept_Total.xlsx')

        training_df_buffer = BytesIO()
        training_df = download_dataset('Datasets/Training Dataset/updated_training_dataset.xlsx', s3, 'eapss3', training_df_buffer)
        print(training_df.shape)

        prev_month_data_buffer = BytesIO()
        prev_month_data = download_dataset('Datasets/Training Dataset/prev_monthly_data_updated.xlsx', s3, 'eapss3', prev_month_data_buffer)
        print("Previous month's data downloaded")
        print(prev_month_data.shape)

        updated_training_df = remove_features(training_df)
        combined_df = pd.concat([updated_training_df, prev_month_data, df])
        print("Datasets combined")

        preprocessed_retraining_df = feature_engineering(combined_df, monthly_dept_total)
        preprocessed_retraining_df = preprocessed_retraining_df[
            preprocessed_retraining_df['Date'] < f'2023-{get_last_month(preprocessed_retraining_df)}-01']

        # ACTUAL DATA
        prevs_month_actual = preprocessed_retraining_df[preprocessed_retraining_df['Date'] >= f'2023-{get_last_month(preprocessed_retraining_df)}-01']
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

        prev_month_data_predict_buffer = BytesIO()
        prevs_month_predict = download_dataset(f'Datasets/Predictions/{prev_leave_year}-{prev_leave_month}.xlsx', s3, 'eapss3', prev_month_data_predict_buffer)
        prev_predict_emp_codes = prevs_month_predict['Employee Code'].tolist()
        print(prev_predict_emp_codes)
        print(len(prev_predict_emp_codes))
        count=0
        for emp_code in prev_predict_emp_codes:
            if emp_code in prev_actual_emp_codes:
                count +=1
                print(emp_code)

        print(count)
        accuracy_model = count/len(prev_predict_emp_codes) * 100
        print("Accuracy comparison:", accuracy_model)
        # Convert both lists to sets for efficient comparison
        prev_actual_emp_set = set(prev_actual_emp_codes)
        prev_predict_emp_set = set(prev_predict_emp_codes)

        # Find common employee codes between the two sets
        common_emp_codes = prev_actual_emp_set.intersection(prev_predict_emp_set)

        # Calculate accuracy
        accuracy = len(common_emp_codes) / len(prev_actual_emp_set) * 100

        # Print accuracy
        print("Accuracy comparison:", accuracy)

        print(preprocessed_retraining_df.shape)
        print("Dataset preprocessed and separated")

        X_retrain = preprocessed_retraining_df[rf_selected_features]
        Y_retrain = preprocessed_retraining_df['TargetCategory']

        rf_model_buffer = BytesIO()
        rf_model = get_model(s3, 'eapss3', 'Models/rf_model_updated.pkl', rf_model_buffer)
        print("rf model loaded")

        cb_model_buffer = BytesIO()
        cb_model = get_model(s3, 'eapss3', 'Models/Catboost_model_updated.pkl', cb_model_buffer)
        print("cb model loaded")

        lgbm_model_buffer = BytesIO()
        lgbm_model = get_model(s3, 'eapss3', 'Models/LightGBM_model_updated.pkl', lgbm_model_buffer)
        print("lgbm model loaded")
        X_retrain.head()
        rf_model.fit(X_retrain, Y_retrain)
        print("RF model retrained")
        cb_model.fit(X_retrain, Y_retrain)
        print("CatBoost model retrained")
        lgbm_model.fit(X_retrain, Y_retrain)
        print("LGBM model retrained")

        upload_file_to_s3(preprocessed_retraining_df, 'eapss3',
                          'Datasets/Training Dataset/updated_training_dataset.xlsx')
        print("Retraining dataset uploaded to S3")

        upload_file_to_s3(df, 'eapss3', 'Datasets/Training Dataset/prev_monthly_data_updated.xlsx')
        print("Updated previous month's data uploaded to S3")

        sewing_model_buffer = BytesIO()
        sewing_model = get_model(s3, 'eapss3', 'Models/Sewing_sarimax.pkl', sewing_model_buffer)
        print("Sewing model loaded")

        mat_model_buffer = BytesIO()
        mat_model = get_model(s3, 'eapss3', 'Models/Mat_sarimax.pkl', mat_model_buffer)
        print("Mat model loaded")

        jumper_model_buffer = BytesIO()
        jumper_model = get_model(s3, 'eapss3', 'Models/Jumper_sarimax.pkl', jumper_model_buffer)
        print("Jumper model loaded")

        sewing_forecast = get_time_series_forecast(sewing_model, 3)
        mat_forecast = get_time_series_forecast(mat_model, 3)
        jumper_forecast = get_time_series_forecast(jumper_model, 3)

        if df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 9:
            updated_df = add_to_dataset(df, sewing_forecast[22], mat_forecast[22], jumper_forecast[22])
        elif df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 10:
            updated_df = add_to_dataset(df, sewing_forecast[23], mat_forecast[23], jumper_forecast[23])
        elif df['LeaveYear'][0] == 2023 and df['LeaveMonth'][0] == 11:
            updated_df = add_to_dataset(df, sewing_forecast[24], mat_forecast[24], jumper_forecast[24])

        df_selected = get_features(updated_df, rf_selected_features)
        print(df_selected.shape)
        rf_pred = predict(rf_model, df_selected)
        cb_pred = predict(cb_model, df_selected)
        lgbm_pred = predict(lgbm_model, df_selected)

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

        filtered_df = predictions_df[(predictions_df['Majority_Vote'] == 'B')]

        # Drop duplicate rows based on the 'Employee_Code' column to keep only unique employee codes
        filtered_df_unique = filtered_df.drop_duplicates(subset=['Employee Code'])
        print("Number of rows in filtered DataFrame:", filtered_df_unique.shape[0])

        upload_model_to_s3(rf_model, 'eapss3', 'Models/rf_model_updated.pkl')
        print("RF model uploaded to S3")

        upload_model_to_s3(cb_model, 'eapss3', 'Models/Catboost_model_updated.pkl')
        print("CatBoost model uploaded to S3")

        upload_model_to_s3(lgbm_model, 'eapss3', 'Models/LightGBM_model_updated.pkl')
        print("LGBM model uploaded to S3")

        upload_file_to_s3(filtered_df_unique, 'eapss3', f"Datasets/Predictions/{df_selected['LeaveYear'][0]}-{df_selected['LeaveMonth'][0]}.xlsx")


        # Create a dictionary with the data
        data = {
            'employee_codes': filtered_df_unique['Employee Code'].tolist(),
            'departments': filtered_df_unique['Department'].tolist(),
            'mean probabilities': filtered_df_unique['Mean_Proba'].tolist(),
            'majority votes': filtered_df_unique['Majority_Vote'].tolist()
        }

        # Return the data as JSON
        return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
