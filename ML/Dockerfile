FROM python:3.11-slim

WORKDIR /app

COPY legal_report.py requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8002

CMD ["uvicorn", "legal_report:app", "--host", "0.0.0.0", "--port", "8002"]
