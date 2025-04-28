from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import numpy as np
from datetime import datetime

# Add parent directory to path to import loan_dataset_generator
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import functions from loan_dataset_generator
from loan_dataset_generator import (
    calculate_financial_stability,
    calculate_payment_history,
    calculate_loan_characteristics,
    add_realistic_noise,
    apply_seasonal_cyclical_pattern
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def calculate_financial_stability(data):
    total_income = (
        data['salary_net_income'] +
        data['social_security_net_income'] +
        data['self_employed_net_income']
    )
    
    # DTI ratio calculation
    monthly_payment = data['recurring_payment_amount']
    dti_ratio = (monthly_payment / total_income) * 100 if total_income > 0 else 100
    
    # Job stability
    job_stability = min(data['months_current_job'] / 60, 1) * 100
    
    # Credit score impact
    credit_score = data['credit_score']
    credit_score_impact = (credit_score / 850) * 100
    
    # Bankruptcy impact
    bankruptcy_penalty = 50 if data['current_bankruptcy_status'] else 0
    
    # Calculate final financial stability score
    financial_stability = (
        (0.4 * (100 - min(dti_ratio, 100))) +  # Lower DTI is better
        (0.3 * job_stability) +
        (0.3 * credit_score_impact)
    )
    
    # Apply bankruptcy penalty
    return max(0, financial_stability - bankruptcy_penalty)

def calculate_payment_history(data):
    total_payments = data['num_payments_ontime'] + data['num_missed_payments']
    
    if total_payments == 0:
        return 50  # Neutral score for no payment history
    
    # Calculate on-time payment percentage
    ontime_ratio = data['num_payments_ontime'] / total_payments
    
    # Impact of delinquencies and defaults
    delinquency_penalty = min(data['past_delinquencies'] * 5, 30)
    default_penalty = 30 if data['ever_default'] else 0
    
    # Base score from on-time payments
    base_score = ontime_ratio * 100
    
    # Apply penalties
    payment_score = max(0, base_score - delinquency_penalty - default_penalty)
    
    # Consider collection history
    if data['past_collection_success']:
        payment_score = min(payment_score + 10, 100)  # Bonus for successful collection
    
    return payment_score

def calculate_loan_characteristics(data):
    # Interest rate impact (higher rate = higher risk)
    rate_score = 100 - min(data['interest_rate'] * 2, 100)
    
    # Loan amount relative to income
    total_income = (
        data['salary_net_income'] +
        data['social_security_net_income'] +
        data['self_employed_net_income']
    )
    loan_to_income = (data['loan_amount'] / total_income) if total_income > 0 else 100
    amount_score = 100 - min(loan_to_income * 20, 100)
    
    # Past due impact
    past_due_penalty = min(data['past_due_days'] / 2, 100)
    
    # Calculate final loan characteristics score
    return (
        (0.4 * rate_score) +
        (0.4 * amount_score) +
        (0.2 * (100 - past_due_penalty))
    )

def add_realistic_noise(score, magnitude=2.0):
    noise = np.random.normal(0, magnitude)
    return np.clip(score + noise, 0, 100)

def apply_seasonal_cyclical_pattern(score, data):
    # Add a small cyclical pattern based on loan amount and credit score
    loan_factor = np.sin(data['loan_amount'] / 1000) * 2
    credit_factor = np.cos(data['credit_score'] / 100) * 2
    return np.clip(score + loan_factor + credit_factor, 0, 100)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received prediction request")
        print("Request data:", request.json)
        
        data = request.json['customerData']
        
        # Print received data for debugging
        print("Customer data received:", data)
        
        # Calculate component scores
        print("Calculating financial stability...")
        financial_stability = calculate_financial_stability(data)
        print("Financial stability score:", financial_stability)
        
        print("Calculating payment history...")
        payment_history = calculate_payment_history(data)
        print("Payment history score:", payment_history)
        
        print("Calculating loan characteristics...")
        loan_characteristics = calculate_loan_characteristics(data)
        print("Loan characteristics score:", loan_characteristics)
        
        # Complex interaction with non-linear combinations
        print("Calculating base score...")
        base_score = (
            financial_stability * 0.5 * (1 + np.exp(payment_history/100 - 1)) +
            payment_history * 0.3 * (1 + np.exp(data['loan_amount']/50000 - 1)) +
            loan_characteristics * 0.2 * (1 + np.exp(financial_stability/100 - 1))
        )
        print("Base score:", base_score)
        
        # Add noise and patterns
        print("Adding noise...")
        score = add_realistic_noise(base_score)
        print("Score after noise:", score)
        
        print("Applying seasonal patterns...")
        final_score = apply_seasonal_cyclical_pattern(score, data)
        print("Final score:", final_score)
        
        # Ensure prediction is between 0 and 100
        prediction = float(np.clip(final_score, 0, 100))
        print("Clipped prediction:", prediction)
        
        response = {
            'collectibility_score': round(prediction, 2),
            'component_scores': {
                'financial_stability': round(financial_stability, 2),
                'payment_history': round(payment_history, 2),
                'loan_characteristics': round(loan_characteristics, 2)
            },
            'timestamp': datetime.now().isoformat()
        }
        print("Sending response:", response)
        
        return jsonify(response)
    
    except Exception as e:
        error_msg = f"Error in prediction: {str(e)}"
        print(error_msg, file=sys.stderr)
        print("Stack trace:", sys.exc_info())
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    # Use port 3001 instead of 5000 to avoid conflict with AirPlay
    port = 3001
    port_file = os.path.join(os.path.dirname(__file__), '.python_service_port')
    print(f"Writing port {port} to {port_file}")
    
    with open(port_file, 'w') as f:
        f.write(str(port))
    
    print(f"Starting Flask server on port {port}")
    app.run(port=port, debug=True) 