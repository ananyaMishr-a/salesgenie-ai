import os, sys, requests
sys.path.insert(0, os.path.abspath('.'))
from dotenv import load_dotenv
load_dotenv()
from simple_salesforce import Salesforce

username = os.getenv('SF_USERNAME')
password = os.getenv('SF_PASSWORD')
security_token = os.getenv('SF_SECURITY_TOKEN')
consumer_key = os.getenv('SF_CONSUMER_KEY')
consumer_secret = os.getenv('SF_CONSUMER_SECRET')

print('Testing SOAP...')
try:
    sf = Salesforce(username=username, password=password, security_token=security_token)
    print('SOAP SUCCESS')
except Exception as e:
    print('SOAP ERROR:', str(e))

print('\nTesting OAuth...')
try:
    payload = {
        'grant_type': 'password',
        'client_id': consumer_key,
        'client_secret': consumer_secret,
        'username': username,
        'password': password + security_token
    }
    res = requests.post('https://login.salesforce.com/services/oauth2/token', data=payload)
    print('OAuth Result:', res.status_code, res.text)
except Exception as e:
    print('OAuth EXCEPTION:', str(e))
