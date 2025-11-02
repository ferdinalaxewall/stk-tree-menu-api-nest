import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { 
  createMockMenu, 
  createMenuHierarchy 
} from '../test-utils/test-helpers';
import { 
  validCreateMenuDto, 
  validCreateChildMenuDto, 
  validUpdateMenuDto,
  menuTestCases 
} from '../test-utils/test-data';

describe('MenuController', () => {
  let controller: MenuController;
  let mockMenuService: jest.Mocked<MenuService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      moveMenu: jest.fn(),
      reorderMenu: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    mockMenuService = module.get(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new menu successfully', async () => {
      const dto: CreateMenuDto = { ...validCreateMenuDto };
      const expectedMenu = createMockMenu(dto);

      mockMenuService.create.mockResolvedValue(expectedMenu);

      const result = await controller.create(dto);

      expect(mockMenuService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedMenu);
    });

    it('should create a child menu successfully', async () => {
      const dto: CreateMenuDto = { ...validCreateChildMenuDto };
      const expectedMenu = createMockMenu({ ...dto, depth: 2 });

      mockMenuService.create.mockResolvedValue(expectedMenu);

      const result = await controller.create(dto);

      expect(mockMenuService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedMenu);
    });

    it('should handle service errors during creation', async () => {
      const dto: CreateMenuDto = { ...validCreateMenuDto };

      mockMenuService.create.mockRejectedValue(new NotFoundException('Parent menu not found'));

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should validate input data through DTOs', async () => {
      const validInputs = menuTestCases.validInputs;

      for (const input of validInputs) {
        const expectedMenu = createMockMenu(input);
        mockMenuService.create.mockResolvedValue(expectedMenu);

        const result = await controller.create(input as CreateMenuDto);

        expect(mockMenuService.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(expectedMenu);
      }
    });
  });

  describe('findAll', () => {
    it('should return all menus in hierarchical structure', async () => {
      const expectedMenus = createMenuHierarchy();

      mockMenuService.findAll.mockResolvedValue(expectedMenus);

      const result = await controller.findAll();

      expect(mockMenuService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedMenus);
    });

    it('should return empty array when no menus exist', async () => {
      mockMenuService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      mockMenuService.findAll.mockRejectedValue(new Error('Database connection error'));

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
    });
  });

  describe('findOne', () => {
    it('should return a single menu by id', async () => {
      const menuId = 'test-menu-id';
      const expectedMenu = createMockMenu({ id: menuId });

      mockMenuService.findOne.mockResolvedValue(expectedMenu);

      const result = await controller.findOne(menuId);

      expect(mockMenuService.findOne).toHaveBeenCalledWith(menuId);
      expect(result).toEqual(expectedMenu);
    });

    it('should throw NotFoundException when menu not found', async () => {
      const menuId = 'non-existent-id';

      mockMenuService.findOne.mockRejectedValue(new NotFoundException('Menu not found'));

      await expect(controller.findOne(menuId)).rejects.toThrow(NotFoundException);
    });

    it('should handle various menu id formats', async () => {
      const testIds = ['uuid-format', '123', 'menu-with-dashes', 'menu_with_underscores'];

      for (const id of testIds) {
        const expectedMenu = createMockMenu({ id });
        mockMenuService.findOne.mockResolvedValue(expectedMenu);

        const result = await controller.findOne(id);

        expect(mockMenuService.findOne).toHaveBeenCalledWith(id);
        expect(result.id).toBe(id);
      }
    });
  });

  describe('update', () => {
    it('should update a menu successfully', async () => {
      const menuId = 'test-menu-id';
      const updateDto: UpdateMenuDto = { ...validUpdateMenuDto };
      const updatedMenu = createMockMenu({ id: menuId, ...updateDto });

      mockMenuService.update.mockResolvedValue(updatedMenu);

      const result = await controller.update(menuId, updateDto);

      expect(mockMenuService.update).toHaveBeenCalledWith(menuId, updateDto);
      expect(result).toEqual(updatedMenu);
    });

    it('should handle partial updates', async () => {
      const menuId = 'test-menu-id';
      const partialUpdateDto: UpdateMenuDto = { name: 'Updated Name Only' };
      const updatedMenu = createMockMenu({ id: menuId, name: 'Updated Name Only' });

      mockMenuService.update.mockResolvedValue(updatedMenu);

      const result = await controller.update(menuId, partialUpdateDto);

      expect(mockMenuService.update).toHaveBeenCalledWith(menuId, partialUpdateDto);
      expect(result.name).toBe('Updated Name Only');
    });

    it('should throw NotFoundException when menu to update not found', async () => {
      const menuId = 'non-existent-id';
      const updateDto: UpdateMenuDto = { ...validUpdateMenuDto };

      mockMenuService.update.mockRejectedValue(new NotFoundException('Menu not found'));

      await expect(controller.update(menuId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a menu successfully', async () => {
      const menuId = 'test-menu-id';

      mockMenuService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(menuId);

      expect(mockMenuService.remove).toHaveBeenCalledWith(menuId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when menu to remove not found', async () => {
      const menuId = 'non-existent-id';

      mockMenuService.remove.mockRejectedValue(new NotFoundException('Menu not found'));

      await expect(controller.remove(menuId)).rejects.toThrow(NotFoundException);
    });

    it('should handle cascade deletion of child menus', async () => {
      const parentMenuId = 'parent-menu-id';

      mockMenuService.remove.mockResolvedValue(undefined);

      await controller.remove(parentMenuId);

      expect(mockMenuService.remove).toHaveBeenCalledWith(parentMenuId);
    });
  });

  describe('move', () => {
    it('should move a menu to new parent successfully', async () => {
      const menuId = 'menu-to-move';
      const newParentId = 'new-parent-id';
      const movedMenu = createMockMenu({ 
        id: menuId, 
        parentId: newParentId, 
        depth: 2 
      });

      mockMenuService.moveMenu.mockResolvedValue(movedMenu);

      const result = await controller.move(menuId, newParentId);

      expect(mockMenuService.moveMenu).toHaveBeenCalledWith(menuId, newParentId);
      expect(result).toEqual(movedMenu);
    });

    it('should move a menu to root level (null parent)', async () => {
      const menuId = 'menu-to-move';
      const movedMenu = createMockMenu({ 
        id: menuId, 
        parentId: null, 
        depth: 1 
      });

      mockMenuService.moveMenu.mockResolvedValue(movedMenu);

      const result = await controller.move(menuId, null);

      expect(mockMenuService.moveMenu).toHaveBeenCalledWith(menuId, null);
      expect(result.parentId).toBeNull();
    });

    it('should handle move operation errors', async () => {
      const menuId = 'menu-to-move';
      const newParentId = 'same-parent-id';

      mockMenuService.moveMenu.mockRejectedValue(
        new BadRequestException('Menu is already in this parent')
      );

      await expect(controller.move(menuId, newParentId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('reorder', () => {
    it('should reorder a menu successfully', async () => {
      const menuId = 'menu-to-reorder';
      const newOrder = 3;
      const reorderedSiblings = [
        createMockMenu({ id: 'sibling-1', order: 1 }),
        createMockMenu({ id: 'sibling-2', order: 2 }),
        createMockMenu({ id: menuId, order: 3 }),
      ];

      mockMenuService.reorderMenu.mockResolvedValue(reorderedSiblings);

      const result = await controller.reorder(menuId, newOrder);

      expect(mockMenuService.reorderMenu).toHaveBeenCalledWith(menuId, newOrder);
      expect(result).toEqual(reorderedSiblings);
    });

    it('should handle invalid order numbers', async () => {
      const menuId = 'menu-to-reorder';
      const invalidOrder = 0;

      mockMenuService.reorderMenu.mockRejectedValue(
        new BadRequestException('Invalid new order')
      );

      await expect(controller.reorder(menuId, invalidOrder))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle reordering with various order values', async () => {
      const menuId = 'menu-to-reorder';
      const testOrders = [1, 5, 10, 100];

      for (const order of testOrders) {
        const reorderedSiblings = [createMockMenu({ id: menuId, order })];
        mockMenuService.reorderMenu.mockResolvedValue(reorderedSiblings);

        const result = await controller.reorder(menuId, order);

        expect(mockMenuService.reorderMenu).toHaveBeenCalledWith(menuId, order);
        expect(result).toEqual(reorderedSiblings);
      }
    });
  });

  describe('error handling', () => {
    it('should propagate service exceptions correctly', async () => {
      const testCases = [
        {
          method: 'create',
          args: [validCreateMenuDto],
          error: new BadRequestException('Invalid input'),
        },
        {
          method: 'findOne',
          args: ['invalid-id'],
          error: new NotFoundException('Menu not found'),
        },
        {
          method: 'update',
          args: ['invalid-id', validUpdateMenuDto],
          error: new NotFoundException('Menu not found'),
        },
        {
          method: 'remove',
          args: ['invalid-id'],
          error: new NotFoundException('Menu not found'),
        },
      ];

      for (const testCase of testCases) {
        mockMenuService[testCase.method].mockRejectedValue(testCase.error);

        await expect(controller[testCase.method](...testCase.args))
          .rejects.toThrow(testCase.error);
      }
    });

    it('should handle unexpected service errors', async () => {
      const unexpectedError = new Error('Unexpected database error');

      mockMenuService.findAll.mockRejectedValue(unexpectedError);

      await expect(controller.findAll()).rejects.toThrow(unexpectedError);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete menu lifecycle', async () => {
      const createDto: CreateMenuDto = { ...validCreateMenuDto };
      const createdMenu = createMockMenu(createDto);
      const updateDto: UpdateMenuDto = { name: 'Updated Menu' };
      const updatedMenu = { ...createdMenu, ...updateDto };

      mockMenuService.create.mockResolvedValue(createdMenu);
      const created = await controller.create(createDto);
      expect(created).toEqual(createdMenu);

      mockMenuService.findOne.mockResolvedValue(createdMenu);
      const found = await controller.findOne(createdMenu.id);
      expect(found).toEqual(createdMenu);

      mockMenuService.update.mockResolvedValue(updatedMenu);
      const updated = await controller.update(createdMenu.id, updateDto);
      expect(updated.name).toBe('Updated Menu');

      // Delete
      mockMenuService.remove.mockResolvedValue(undefined);
      await controller.remove(createdMenu.id);
      expect(mockMenuService.remove).toHaveBeenCalledWith(createdMenu.id);
    });
  });
});
