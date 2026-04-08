# Example: Fraud Detection Model

## Input
Detect fraudulent transactions

## Pipeline

1. Data Cleaning
2. Feature Engineering
3. Model Training

## Features
- transaction_amount
- frequency
- location mismatch

## Model

from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

## Evaluation
- Accuracy
- Precision/Recall
- ROC-AUC

## Deployment
- REST API using FastAPI