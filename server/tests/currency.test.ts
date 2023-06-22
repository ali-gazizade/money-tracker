import request from 'supertest';
import app from '../app';
import CurrencyModel, { Currency } from '../models/currency';

describe('Currency API', () => {
  beforeEach(async () => {
    await CurrencyModel.deleteMany({});
    await CurrencyModel.create({ name: 'AZN', isDefault: true, active: true });
    await CurrencyModel.create({ name: 'USD', isDefault: false, active: true });
    await CurrencyModel.create({ name: 'EUR', isDefault: false, active: true });
  });

  afterAll(async () => {
    await CurrencyModel.deleteMany({});
    await CurrencyModel.create({ name: 'AZN', isDefault: true, active: true });
    await CurrencyModel.create({ name: 'USD', isDefault: false, active: true });
    await CurrencyModel.create({ name: 'EUR', isDefault: false, active: true });
  });

  describe('GET /currency/list', () => {
    it('should get all currencies', async () => {
      const response = await request(app).get('/currency/list');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });
  });

  describe('POST /currency', () => {
    it('should create a new currency', async () => {
      const newCurrency: Partial<Currency> = { name: 'GBP', isDefault: false };

      const response = await request(app).post('/currency').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(newCurrency.isDefault);

      const currency = await CurrencyModel.findById(response.body._id);
      expect(currency).not.toBeNull();
      expect(currency?.name).toBe(newCurrency.name);
      expect(currency?.isDefault).toBe(newCurrency.isDefault);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidCurrency: Partial<Currency> = { isDefault: false };

      const response = await request(app).post('/currency').send(invalidCurrency);

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toBe('Name is required');

      const currencies = await CurrencyModel.find();
      expect(currencies).toHaveLength(3);
    });

    it('should switch default true to false, if there are 2 defaults', async () => {
      const newCurrency: Partial<Currency> = { name: 'GBP', isDefault: true };

      const response = await request(app).post('/currency').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(!newCurrency.isDefault);
    });

    it('should switch default false to true, if there are no defaults', async () => {
      await CurrencyModel.deleteMany({});
      
      const newCurrency: Partial<Currency> = { name: 'GBP', isDefault: false };

      const response = await request(app).post('/currency').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(!newCurrency.isDefault);
    });
  });

  describe('PUT /currency/:id', () => {
    it('should update a currency', async () => {
      const currency = await CurrencyModel.findOne().exec();

      expect(currency).toBeTruthy();

      const updatedCurrency: Partial<Currency> = { name: 'GBP', isDefault: false };

      const response = await request(app).put(`/currency/${currency?._id}`).send(updatedCurrency);

      expect(response.status).toBe(200);

      const updatedCurrencyInDB = await CurrencyModel.findById(currency?._id);
      expect(updatedCurrencyInDB).toBeTruthy();
      expect(updatedCurrencyInDB?.name).toBe(updatedCurrency.name);
      expect(updatedCurrencyInDB?.isDefault).toBe(updatedCurrency.isDefault);
    });

    it('should return 404 if currency is not found', async () => {
      const updatedCurrency: Partial<Currency> = { name: 'GBP', isDefault: false };

      const response = await request(app).put('/currency/inv').send(updatedCurrency);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Currency not found');
    });

    it('should remove a currency', async () => {
      const currency = await CurrencyModel.findOne().exec();

      expect(currency).toBeTruthy();

      const updatedCurrency: Partial<Currency> = { active: false };

      const response = await request(app).put(`/currency/${currency?._id}`).send(updatedCurrency);

      expect(response.status).toBe(200);

      const updatedCurrencyInDB = await CurrencyModel.findById(currency?._id);
      expect(updatedCurrencyInDB).toBeTruthy();
      expect(updatedCurrencyInDB?.active).toBe(false);
    });
  });
});
