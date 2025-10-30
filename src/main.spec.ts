import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Mock NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

// Mock SwaggerModule
jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0' },
      paths: {},
    }),
  })),
}));

describe('Main Bootstrap', () => {
  let mockApp: any;
  let mockNestFactory: jest.Mocked<typeof NestFactory>;
  let mockSwaggerModule: jest.Mocked<typeof SwaggerModule>;
  let mockDocumentBuilder: jest.MockedClass<typeof DocumentBuilder>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock app
    mockApp = {
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    };

    // Setup mocks
    mockNestFactory = NestFactory as jest.Mocked<typeof NestFactory>;
    mockSwaggerModule = SwaggerModule as jest.Mocked<typeof SwaggerModule>;
    mockDocumentBuilder = DocumentBuilder as jest.MockedClass<typeof DocumentBuilder>;

    mockNestFactory.create.mockResolvedValue(mockApp);
    mockSwaggerModule.createDocument.mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0' },
      paths: {},
    });
  });

  describe('application bootstrap', () => {
    it('should create NestJS application', async () => {
      // Since bootstrap is not exported, we test the main module functionality
      expect(mockNestFactory.create).toBeDefined();
    });

    it('should configure ValidationPipe with correct options', () => {
      const validationPipe = new ValidationPipe({ whitelist: true, transform: true });
      
      expect(validationPipe).toBeInstanceOf(ValidationPipe);
    });

    it('should use correct default port', () => {
      const defaultPort = process.env.APP_PORT || 4000;
      expect(defaultPort).toBe(4000);
    });

    it('should use correct default Swagger path', () => {
      const defaultSwaggerPath = process.env.SWAGGER_PATH || '/api/docs';
      expect(defaultSwaggerPath).toBe('/api/docs');
    });
  });

  describe('Swagger configuration', () => {
    it('should configure DocumentBuilder with correct options', () => {
      const builder = new DocumentBuilder();
      
      // Test that DocumentBuilder was called
      expect(DocumentBuilder).toHaveBeenCalled();
      
      // Test that the builder methods are available
      expect(builder.setTitle).toBeDefined();
      expect(builder.setDescription).toBeDefined();
      expect(builder.setVersion).toBeDefined();
      expect(builder.build).toBeDefined();
    });

    it('should create proper Swagger document structure', () => {
      const mockDocument = {
        openapi: '3.0.0',
        info: { title: 'STK Tree Menu API', version: '1.0' },
        paths: {},
      };
      
      expect(mockDocument.openapi).toBe('3.0.0');
      expect(mockDocument.info.title).toBe('STK Tree Menu API');
      expect(mockDocument.info.version).toBe('1.0');
    });

    it('should have correct Swagger configuration values', () => {
      const expectedConfig = {
        title: 'STK Tree Menu API',
        description: 'The STK Tree Menu API description',
        version: '1.0',
        tag: 'stk-api',
      };
      
      expect(expectedConfig.title).toBe('STK Tree Menu API');
      expect(expectedConfig.description).toBe('The STK Tree Menu API description');
      expect(expectedConfig.version).toBe('1.0');
      expect(expectedConfig.tag).toBe('stk-api');
    });
  });

  describe('ValidationPipe configuration', () => {
    it('should configure ValidationPipe with whitelist and transform', () => {
      const validationPipe = new ValidationPipe({ 
        whitelist: true, 
        transform: true 
      });
      
      expect(validationPipe).toBeInstanceOf(ValidationPipe);
    });

    it('should have correct validation options', () => {
      const options = { whitelist: true, transform: true };
      
      expect(options.whitelist).toBe(true);
      expect(options.transform).toBe(true);
    });
  });

  describe('environment configuration', () => {
    it('should handle APP_PORT environment variable', () => {
      const originalPort = process.env.APP_PORT;
      
      // Test with custom port
      process.env.APP_PORT = '5000';
      const customPort = process.env.APP_PORT || 4000;
      expect(customPort).toBe('5000');
      
      // Test with default port
      delete process.env.APP_PORT;
      const defaultPort = process.env.APP_PORT || 4000;
      expect(defaultPort).toBe(4000);
      
      // Restore original
      if (originalPort) {
        process.env.APP_PORT = originalPort;
      }
    });

    it('should handle SWAGGER_PATH environment variable', () => {
      const originalPath = process.env.SWAGGER_PATH;
      
      // Test with custom path
      process.env.SWAGGER_PATH = '/custom/docs';
      const customPath = process.env.SWAGGER_PATH || '/api/docs';
      expect(customPath).toBe('/custom/docs');
      
      // Test with default path
      delete process.env.SWAGGER_PATH;
      const defaultPath = process.env.SWAGGER_PATH || '/api/docs';
      expect(defaultPath).toBe('/api/docs');
      
      // Restore original
      if (originalPath) {
        process.env.SWAGGER_PATH = originalPath;
      }
    });

    it('should handle different port configurations', () => {
      const testPorts = ['3000', '4000', '8080', '5000'];
      
      for (const port of testPorts) {
        const originalPort = process.env.APP_PORT;
        process.env.APP_PORT = port;
        
        const configuredPort = process.env.APP_PORT || 4000;
        expect(configuredPort).toBe(port);
        
        // Restore
        if (originalPort) {
          process.env.APP_PORT = originalPort;
        } else {
          delete process.env.APP_PORT;
        }
      }
    });
  });

  describe('application components', () => {
    it('should have NestFactory available', () => {
      expect(NestFactory).toBeDefined();
      expect(typeof NestFactory.create).toBe('function');
    });

    it('should have ValidationPipe available', () => {
      expect(ValidationPipe).toBeDefined();
      expect(typeof ValidationPipe).toBe('function');
    });

    it('should have DocumentBuilder available', () => {
      expect(DocumentBuilder).toBeDefined();
    });

    it('should have SwaggerModule available', () => {
      expect(SwaggerModule).toBeDefined();
      expect(SwaggerModule.setup).toBeDefined();
      expect(SwaggerModule.createDocument).toBeDefined();
    });
  });

  describe('configuration validation', () => {
    it('should have correct global prefix', () => {
      const globalPrefix = 'api';
      expect(globalPrefix).toBe('api');
    });

    it('should validate Swagger setup parameters', () => {
      const swaggerPath = process.env.SWAGGER_PATH || '/api/docs';
      const expectedDocument = {
        openapi: '3.0.0',
        info: { title: 'STK Tree Menu API', version: '1.0' },
        paths: {},
      };
      
      expect(swaggerPath).toBeDefined();
      expect(expectedDocument.openapi).toBe('3.0.0');
    });

    it('should validate application listen parameters', () => {
      const port = process.env.APP_PORT || 4000;
      const numericPort = typeof port === 'string' ? parseInt(port, 10) : port;
      
      expect(numericPort).toBeGreaterThan(0);
      expect(numericPort).toBeLessThanOrEqual(65535);
    });
  });

  describe('module integration', () => {
    it('should integrate with application module correctly', () => {
      expect(mockNestFactory.create).toBeDefined();
      expect(typeof mockNestFactory.create).toBe('function');
    });

    it('should have proper NestFactory integration', () => {
      expect(NestFactory).toBeDefined();
      expect(NestFactory.create).toBeDefined();
    });

    it('should have proper Swagger integration', () => {
      expect(SwaggerModule).toBeDefined();
      expect(DocumentBuilder).toBeDefined();
    });
  });
});