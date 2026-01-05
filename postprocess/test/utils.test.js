import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import https from 'node:https';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { httpsGet, getImageSize } from '../lib/utils.js';

describe('utils', () => {
  describe('httpsGet', () => {
    it('should fetch content via HTTPS', async () => {
      const mockResponse = new EventEmitter();
      mockResponse.statusCode = 200;
      mockResponse.headers = { 'content-type': 'text/plain' };
      
      const mockRequest = new EventEmitter();
      mockRequest.destroy = () => {};

      mock.method(https, 'get', (url, options, callback) => {
        callback(mockResponse);
        setTimeout(() => {
          mockResponse.emit('data', 'hello');
          mockResponse.emit('data', ' world');
          mockResponse.emit('end');
        }, 10);
        return mockRequest;
      });

      const res = await httpsGet('https://example.com');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body, 'hello world');
      
      mock.restoreAll();
    });

    it('should fetch content via HTTP', async () => {
      const mockResponse = new EventEmitter();
      mockResponse.statusCode = 200;
      mockResponse.headers = { 'content-type': 'text/plain' };
      
      const mockRequest = new EventEmitter();
      mockRequest.destroy = () => {};

      mock.method(http, 'get', (url, options, callback) => {
        callback(mockResponse);
        setTimeout(() => {
          mockResponse.emit('data', 'hello http');
          mockResponse.emit('end');
        }, 10);
        return mockRequest;
      });

      const res = await httpsGet('http://example.com');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body, 'hello http');
      
      mock.restoreAll();
    });

    it('should handle errors', async () => {
      const mockRequest = new EventEmitter();
      mockRequest.destroy = () => {};

      mock.method(https, 'get', (url, options, callback) => {
        setTimeout(() => {
          mockRequest.emit('error', new Error('Network error'));
        }, 10);
        return mockRequest;
      });

      await assert.rejects(
        httpsGet('https://example.com'),
        { message: 'Network error' }
      );
      
      mock.restoreAll();
    });
  });

  describe('getImageSize', () => {
    // 1x1 pixel JPEG
    const jpegData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xc4, 0x00, 0x15,
      0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x05, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00,
      0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0xb2, 0xc0, 0x07, 0xff, 0xd9
    ]);

    it('should return image dimensions for valid JPEG via HTTPS', async () => {
      const mockResponse = new EventEmitter();
      const mockRequest = new EventEmitter();
      mockRequest.destroy = mock.fn();

      mock.method(https, 'get', (url, options, callback) => {
        assert.strictEqual(options.headers.Range, 'bytes=0-262143');
        callback(mockResponse);
        setTimeout(() => {
          mockResponse.emit('data', jpegData);
          mockResponse.emit('end');
        }, 10);
        return mockRequest;
      });

      const size = await getImageSize('https://example.com/test.jpg');
      assert.strictEqual(size.width, 1);
      assert.strictEqual(size.height, 1);
      
      mock.restoreAll();
    });

    it('should return image dimensions for valid JPEG via HTTP', async () => {
      const mockResponse = new EventEmitter();
      const mockRequest = new EventEmitter();
      mockRequest.destroy = mock.fn();

      mock.method(http, 'get', (url, options, callback) => {
        assert.strictEqual(options.headers.Range, 'bytes=0-262143');
        callback(mockResponse);
        setTimeout(() => {
          mockResponse.emit('data', jpegData);
          mockResponse.emit('end');
        }, 10);
        return mockRequest;
      });

      const size = await getImageSize('http://example.com/test.jpg');
      assert.strictEqual(size.width, 1);
      assert.strictEqual(size.height, 1);
      
      mock.restoreAll();
    });

    it('should terminate request and return size if data exceeds MAX_RECEIVE_SIZE', async () => {
      const mockResponse = new EventEmitter();
      const mockRequest = new EventEmitter();
      mockRequest.destroy = mock.fn();

      mock.method(https, 'get', (url, options, callback) => {
        callback(mockResponse);
        setTimeout(() => {
          // Send JPEG data first
          mockResponse.emit('data', jpegData);
          // Then send a large chunk to trigger destroy
          mockResponse.emit('data', Buffer.alloc(300000));
          // Note: we don't emit 'end' here, simulating a server that ignores Range
        }, 10);
        return mockRequest;
      });

      const size = await getImageSize('https://example.com/large.jpg');
      assert.strictEqual(size.width, 1);
      assert.strictEqual(size.height, 1);
      assert.strictEqual(mockRequest.destroy.mock.callCount(), 1, 'req.destroy() should be called');
      
      mock.restoreAll();
    });
  });
});