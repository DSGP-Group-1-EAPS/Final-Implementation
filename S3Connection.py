import pickle

import boto3
import pandas as pd
from io import BytesIO
# Global variables to store access keys and region
global_access_key_id = None
global_secret_access_key = None
global_region_name = None


def get_s3_access(access_key_id, secret_access_key, region_name):
    global global_access_key_id, global_secret_access_key, global_region_name
    global_access_key_id = access_key_id
    global_secret_access_key = secret_access_key
    global_region_name = region_name

    s3 = boto3.client('s3', aws_access_key_id=global_access_key_id, aws_secret_access_key=global_secret_access_key)

    return s3


def upload_model_to_s3(model, bucket_name, s3_key):
    s3_client = get_s3_access(global_access_key_id, global_secret_access_key, global_region_name)

    try:
        # Convert model to BytesIO buffer
        model_buffer = BytesIO()
        pickle.dump(model, model_buffer)
        model_buffer.seek(0)

        # Upload model to S3
        s3_client.upload_fileobj(model_buffer, bucket_name, s3_key)
        print(f"Model uploaded successfully to s3://{bucket_name}/{s3_key}")
    except Exception as e:
        print(f"Error uploading model to S3: {e}")


def upload_file_to_s3(df, bucket_name, s3_key):
    s3_client = get_s3_access(global_access_key_id, global_secret_access_key, global_region_name)

    try:
        # Convert DataFrame to Excel file in memory
        excel_upload_buffer = BytesIO()
        df.to_excel(excel_upload_buffer, index=False)
        excel_upload_buffer.seek(0)

        # Upload Excel file to S3
        s3_client.upload_fileobj(excel_upload_buffer, bucket_name, s3_key)
        print(f"DataFrame uploaded successfully to s3://{bucket_name}/{s3_key}")
    except Exception as e:
        print(f"Error uploading DataFrame: {e}")


def get_model(s3, bucket_name, key, model_buffer):
    try:
        # Download pickled model from S3 into BytesIO buffer
        s3.download_fileobj(bucket_name, key, model_buffer)
        model_buffer.seek(0)

        # Load pickled model from BytesIO buffer
        loaded_model = pickle.load(model_buffer)

        return loaded_model
    except Exception as e:
        print(f"Error downloading model from S3: {e}")
        return None


def download_dataset(key, s3, bucket_name, dataset_buffer):

    try:
        s3.download_fileobj(bucket_name, key, dataset_buffer)
        dataset_buffer.seek(0)

        # Read Excel file into DataFrame
        df = pd.read_excel(dataset_buffer)

        return df
    except Exception as e:
        print(f"Error downloading DataFrame from S3: {e}")
        return None
