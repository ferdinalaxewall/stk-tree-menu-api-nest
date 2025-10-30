import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { 
  createMockRepository, 
  createMockMenu, 
  createMenuHierarchy,
  MockRepository 
} from '../test-utils/test-helpers';
import { 
  validCreateMenuDto, 
  validCreateChildMenuDto, 
  validUpdateMenuDto 
} from '../test-utils/test-data';

describe('MenuService', () => {
  let service: MenuService;
  let mockRepository: MockRepository<Menu>;

  beforeEach(async () => {
    mockRepository = createMockRepository<Menu>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(Menu),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a root menu successfully', async () => {
      const dto: CreateMenuDto = { ...validCreateMenuDto };
      const mockMenu = createMockMenu(dto);

      mockRepository.create.mockReturnValue(mockMenu);
      mockRepository.save.mockResolvedValue(mockMenu);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMenu);
      expect(result).toEqual(mockMenu);
      expect(result.depth).toBe(1);
    });

    it('should create a child menu with correct depth', async () => {
      const parentMenu = createMockMenu({ id: 'parent-id', depth: 1 });
      const dto: CreateMenuDto = { ...validCreateChildMenuDto };
      const childMenu = createMockMenu({ ...dto, depth: 2 });

      mockRepository.create.mockReturnValue(childMenu);
      mockRepository.findOne.mockResolvedValue(parentMenu);
      mockRepository.save.mockResolvedValue(childMenu);

      const result = await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.parentId },
      });
      expect(result.depth).toBe(2);
    });

    it('should throw NotFoundException when parent does not exist', async () => {
      const dto: CreateMenuDto = { ...validCreateChildMenuDto };

      mockRepository.create.mockReturnValue(createMockMenu(dto));
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.parentId },
      });
    });

    it('should handle menu creation without parentId', async () => {
      const dto: CreateMenuDto = { name: 'Root Menu', slug: 'root-menu' };
      const mockMenu = createMockMenu({ ...dto, depth: 1 });

      mockRepository.create.mockReturnValue(mockMenu);
      mockRepository.save.mockResolvedValue(mockMenu);

      const result = await service.create(dto);

      expect(result.depth).toBe(1);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return hierarchical menu structure', async () => {
      const menus = createMenuHierarchy();
      const flatMenus = menus.map(menu => ({ ...menu, children: [] }));

      mockRepository.find.mockResolvedValue(flatMenus);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['children'],
        order: { order: 'ASC' }
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no menus exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should build correct tree structure', async () => {
      const parent = createMockMenu({ id: 'parent', parentId: null, order: 1 });
      const child = createMockMenu({ id: 'child', parentId: 'parent', order: 1 });
      const menus = [parent, child];

      mockRepository.find.mockResolvedValue(menus);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('parent');
    });
  });

  describe('findOne', () => {
    it('should return menu by id', async () => {
      const mockMenu = createMockMenu();

      mockRepository.findOne.mockResolvedValue(mockMenu);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['children'],
      });
      expect(result).toEqual(mockMenu);
    });

    it('should throw NotFoundException when menu not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update menu successfully', async () => {
      const existingMenu = createMockMenu();
      const updateDto: UpdateMenuDto = { ...validUpdateMenuDto };
      const updatedMenu = { ...existingMenu, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingMenu);
      mockRepository.save.mockResolvedValue(updatedMenu);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(updatedMenu);
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when menu to update not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', validUpdateMenuDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove menu successfully', async () => {
      const mockMenu = createMockMenu();

      mockRepository.findOne.mockResolvedValue(mockMenu);
      mockRepository.remove.mockResolvedValue(mockMenu);

      await service.remove('test-id');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockMenu);
    });

    it('should throw NotFoundException when menu to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveMenu', () => {
    it('should move menu to new parent successfully', async () => {
      const menu = createMockMenu({ id: 'menu-id', parentId: 'old-parent', depth: 2 });
      const newParent = createMockMenu({ id: 'new-parent', depth: 1 });
      const movedMenu = { ...menu, parentId: 'new-parent', depth: 2, order: 1 };

      mockRepository.findOne
        .mockResolvedValueOnce(menu)
        .mockResolvedValueOnce(newParent);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(movedMenu);

      const result = await service.moveMenu('menu-id', 'new-parent');

      expect(result.parentId).toBe('new-parent');
      expect(result.depth).toBe(2);
    });

    it('should move menu to root level', async () => {
      const menu = createMockMenu({ id: 'menu-id', parentId: 'parent', depth: 2 });
      const movedMenu = { ...menu, parentId: null, depth: 1, order: 1 };

      mockRepository.findOne.mockResolvedValue(menu);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(movedMenu);

      const result = await service.moveMenu('menu-id', null);

      expect(result.parentId).toBeNull();
      expect(result.depth).toBe(1);
    });

    it('should throw BadRequestException when menu already in target parent', async () => {
      const menu = createMockMenu({ parentId: 'same-parent' });

      mockRepository.findOne.mockResolvedValue(menu);

      await expect(service.moveMenu('menu-id', 'same-parent'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when new parent not found', async () => {
      const menu = createMockMenu({ parentId: 'old-parent' });

      mockRepository.findOne
        .mockResolvedValueOnce(menu)
        .mockResolvedValueOnce(null);

      await expect(service.moveMenu('menu-id', 'non-existent-parent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderMenu', () => {
    it('should reorder menu successfully', async () => {
      const menu = createMockMenu({ id: 'menu-id', order: 2, parentId: 'parent' });
      const siblings = [
        createMockMenu({ id: 'sibling-1', order: 1, parentId: 'parent' }),
        menu,
        createMockMenu({ id: 'sibling-3', order: 3, parentId: 'parent' }),
      ];
      const reorderedSiblings = siblings.map(s => ({ ...s, order: s.id === 'menu-id' ? 1 : s.order + 1 }));

      mockRepository.findOne.mockResolvedValue(menu);
      mockRepository.find
        .mockResolvedValueOnce(siblings)
        .mockResolvedValueOnce(reorderedSiblings);
      mockRepository.save.mockResolvedValue(reorderedSiblings);

      const result = await service.reorderMenu('menu-id', 1);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid order', async () => {
      const menu = createMockMenu({ order: 2 });
      const siblings = [menu];

      mockRepository.findOne.mockResolvedValue(menu);
      mockRepository.find.mockResolvedValue(siblings);

      await expect(service.reorderMenu('menu-id', 5))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for order less than 1', async () => {
      const menu = createMockMenu({ order: 2 });
      const siblings = [menu];

      mockRepository.findOne.mockResolvedValue(menu);
      mockRepository.find.mockResolvedValue(siblings);

      await expect(service.reorderMenu('menu-id', 0))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('buildTree', () => {
    it('should build correct hierarchical structure', async () => {
      const menus = [
        createMockMenu({ id: 'parent', parentId: null }),
        createMockMenu({ id: 'child1', parentId: 'parent' }),
        createMockMenu({ id: 'child2', parentId: 'parent' }),
        createMockMenu({ id: 'grandchild', parentId: 'child1' }),
      ];

      mockRepository.find.mockResolvedValue(menus);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('parent');
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const dto: CreateMenuDto = { ...validCreateMenuDto };

      mockRepository.create.mockReturnValue(createMockMenu(dto));
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(dto)).rejects.toThrow('Database error');
    });

    it('should handle repository errors in findAll', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database connection error'));

      await expect(service.findAll()).rejects.toThrow('Database connection error');
    });
  });
});
