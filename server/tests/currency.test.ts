import request from 'supertest';
import app from '../app';
import CurrencyModel, { Currency } from '../models/currency';

describe('Currency API', () => {
  it('should create, read, update, remove the currencies', async () => {
    // Create
    const currencies: Partial<Currency>[] = [
      { name: 'AZN', isDefault: false },
      { name: 'USD', isDefault: false },
      { name: 'GBP', isDefault: false },
    ];

    const ids = [];
    for (const currency of currencies) {
      const createRes = await request(app).post('/currency/create').send(currency);
      expect(createRes.status).toBe(201);
      expect(createRes.body._id).toBeTruthy();
      ids.push(createRes.body._id);
    }
    
    // List
    const listRes = await request(app).get('/currency/list');
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(ids.length);

    // Get
    const getRes = await request(app).get(`/currency/get/${ids[0]}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe(currencies[0].name);
    expect(getRes.body.isDefault).toBe(true);

    // Update
    const updatedCurrency: Partial<Currency> = { name: 'Test', isDefault: false };
    const updateRes = await request(app).put(`/currency/update/${ids[0]}`).send(updatedCurrency);

    expect(updateRes.status).toBe(200);

    // Get updated
    const getUpdatedRes = await request(app).get(`/currency/get/${ids[0]}`);

    expect(getUpdatedRes.status).toBe(200);
    expect(getUpdatedRes.body.name).toBe(updatedCurrency.name);
    expect(getUpdatedRes.body.isDefault).toBe(true);

    // Remove
    const removeRes = await request(app).put(`/currency/update/${ids[0]}`).send({ active: false });

    expect(removeRes.status).toBe(200);

    // Create another one as default
    await request(app).post('/currency/create').send({ name: 'EUR', isDefault: true });

    // List for final result
    const listFinalRes = await request(app).get('/currency/list');
    expect(listFinalRes.status).toBe(200);
    expect(listFinalRes.body.length).toBe(3);

    const finalIds = listFinalRes.body.map((e: Partial<Currency>) => e._id);
    const defaultCount = listFinalRes.body.reduce((total: number, e: Partial<Currency>) => total + (e.isDefault ? 1 : 0), 0);
    expect(finalIds).not.toContain(ids[0]);
    expect(defaultCount).toBe(1);
  });
});
