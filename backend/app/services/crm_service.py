import os
import requests
from simple_salesforce import Salesforce, SalesforceAuthenticationFailed
from fastapi import HTTPException
from app import models

def get_salesforce_client():
    """
    Initializes and returns a Salesforce client using environment variables.
    """
    username = os.getenv("SF_USERNAME")
    password = os.getenv("SF_PASSWORD")
    security_token = os.getenv("SF_SECURITY_TOKEN")
    consumer_key = os.getenv("SF_CONSUMER_KEY")
    consumer_secret = os.getenv("SF_CONSUMER_SECRET")

    if not all([username, password, security_token]):
        raise HTTPException(status_code=500, detail="Salesforce credentials (username, password, security_token) are missing from the server environment.")

    try:
        # Standard SOAP Login using simple-salesforce
        # If the org requires OAuth because basic auth is disabled, this might fail,
        # but Developer editions usually allow standard login using security token.
        sf = Salesforce(
            username=username,
            password=password,
            security_token=security_token
        )
        return sf
    except SalesforceAuthenticationFailed as e:
        # If basic login fails, try OAuth Password flow using Connected App credentials
        if consumer_key and consumer_secret:
            try:
                payload = {
                    'grant_type': 'password',
                    'client_id': consumer_key,
                    'client_secret': consumer_secret,
                    'username': username,
                    'password': f"{password}{security_token}"
                }
                # Default to login.salesforce.com for production/dev orgs
                token_url = 'https://login.salesforce.com/services/oauth2/token'
                res = requests.post(token_url, data=payload)
                if not res.ok:
                    raise Exception(f"OAuth failed with status {res.status_code}: {res.text}")
                res.raise_for_status()
                data = res.json()
                
                sf = Salesforce(instance_url=data['instance_url'], session_id=data['access_token'])
                return sf
            except Exception as oauth_err:
                raise HTTPException(status_code=500, detail=f"Salesforce OAuth Authentication Failed: {str(oauth_err)}")
        else:
            raise HTTPException(status_code=500, detail=f"Salesforce Authentication Failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Salesforce: {str(e)}")


def push_lead_to_salesforce(lead: models.Lead):
    """
    Pushes a Lead object to Salesforce.
    If the Lead exists (by Email), it could update it, but for simplicity, we insert a new Lead.
    """
    sf = get_salesforce_client()

    # Split name into First and Last Name (Salesforce requires LastName)
    name_parts = lead.contact_name.split(" ", 1)
    first_name = name_parts[0] if len(name_parts) > 1 else ""
    last_name = name_parts[1] if len(name_parts) > 1 else lead.contact_name

    if not last_name:
        last_name = "Unknown" # Salesforce requires Last Name
    
    company = lead.company_name if lead.company_name else "Unknown Company"
    insights_parts = []
    if lead.insights:
        for insight in lead.insights:
            if insight.business_needs:
                insights_parts.append(f"Business Needs: {insight.business_needs}")
            if insight.opportunities:
                insights_parts.append(f"Opportunities: {insight.opportunities}")
            if insight.industry_analysis:
                insights_parts.append(f"Industry Analysis: {insight.industry_analysis}")
    insights_text = "\n".join(insights_parts)

    lead_record = {
        'FirstName': first_name,
        'LastName': last_name,
        'Company': company,
        'Email': lead.email,
        'LeadSource': 'SalesGenie AI',
        'Description': insights_text
    }

    try:
        # Check if lead already exists
        query = f"SELECT Id FROM Lead WHERE Email = '{lead.email}' LIMIT 1"
        result = sf.query(query)
        
        if result['totalSize'] > 0:
            # Update existing lead
            sf_lead_id = result['records'][0]['Id']
            sf.Lead.update(sf_lead_id, lead_record)
            return {"status": "updated", "sf_id": sf_lead_id}
        else:
            # Create new lead
            res = sf.Lead.create(lead_record)
            return {"status": "created", "sf_id": res.get('id')}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Salesforce API Error: {str(e)}")
