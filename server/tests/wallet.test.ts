import request from 'supertest';
import app from '../app';
import WalletModel from '../models/wallet';

describe('Wallet API', () => {
  describe('GET /list', () => {
    it('should get all active wallets', async () => {
      // From API
      const response = await request(app).get('/wallet/list');

      // Count from db
      const activeWalletCount = await WalletModel.count({ active: true });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(activeWalletCount);
    });
  });

  describe('PUT /wallet/update/:id', () => {
    it('should update a wallet', async () => {
      const wallet = await WalletModel.create({ name: 'Wallet x', firstTimeAmounts: [], active: true });

      const updatedWalletData = { name: 'Updated Wallet', firstTimeAmounts: [] };

      const response = await request(app)
        .put(`/wallet/update/${wallet._id}`)
        .send(updatedWalletData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedWalletData.name);

      const updatedWallet = await WalletModel.findById(wallet._id);
      expect(updatedWallet).not.toBeNull();
      expect(updatedWallet?.name).toBe(updatedWalletData.name);
    });

    it('should return 404 if wallet is not found', async () => {
      const updatedWalletData = { name: 'Updated Wallet', firstTimeAmounts: [] };

      const response = await request(app)
        .put('/wallet/update/invalid')
        .send(updatedWalletData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet ID');
    });

    it('should return 400 if wallet ID is invalid', async () => {
      const updatedWalletData = { name: 'Updated Wallet', firstTimeAmounts: [] };

      const response = await request(app)
        .put('/wallet/update/123')
        .send(updatedWalletData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet ID');
    });
  });

  describe('POST /wallet/create', () => {
    it('should create a new wallet', async () => {
      const newWalletData = { name: 'New Wallet', firstTimeAmounts: [] };

      const response = await request(app)
        .post('/wallet/create')
        .send(newWalletData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newWalletData.name);

      const createdWallet = await WalletModel.findById(response.body._id);
      expect(createdWallet).not.toBeNull();
      expect(createdWallet?.name).toBe(newWalletData.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidWalletData = { firstTimeAmounts: [] };

      const response = await request(app)
        .post('/wallet/create')
        .send(invalidWalletData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toBe('Name is required');
    });

    it('should return 400 if firstTimeAmounts is empty', async () => {
      const invalidWalletData = { name: 'New Wallet' };

      const response = await request(app)
        .post('/wallet/create')
        .send(invalidWalletData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toBe('First time amounts must be provided');
    });
  });
});
