FROM python:3.9

WORKDIR /app

COPY requirements.txt .

RUN pip install cryptography

RUN pip install python-multipart

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
