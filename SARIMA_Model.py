from statsmodels.tsa.statespace.sarimax import SARIMAX
import pickle


def ts_load_model(model_path):
    with open(model_path, 'rb') as file:
        return pickle.load(file)


def get_time_series_forecast(model, steps):
    forecast = model.forecast(steps=steps)
    return forecast


def add_to_dataset(df, sewing_forecast, mat_forecast, jumper_forecast):
    print(sewing_forecast, mat_forecast, jumper_forecast)
    sewing_forecast = int(sewing_forecast)
    mat_forecast = int(mat_forecast)
    jumper_forecast = int(jumper_forecast)
    for index, row in df.iterrows():
        sub_dept = row['Encoded Department']
        if sub_dept == 2:
            df.at[index, 'MonthlyDeptTotal'] = sewing_forecast
        elif sub_dept == 1:
            df.at[index, 'MonthlyDeptTotal'] = mat_forecast
        elif sub_dept == 0:
            df.at[index, 'MonthlyDeptTotal'] = jumper_forecast
    return df

