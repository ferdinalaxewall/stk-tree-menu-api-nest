import { Repository } from 'typeorm';
import { Menu } from '../menu/entities/menu.entity';

export type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

export const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  })),
});

export const createMockMenu = (overrides: Partial<Menu> = {}): Menu => ({
  id: 'test-id-1',
  parentId: null,
  name: 'Test Menu',
  slug: 'test-menu',
  depth: 1,
  order: 1,
  parent: null,
  children: [],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

export const createMenuHierarchy = (): Menu[] => {
  const parent = createMockMenu({
    id: 'parent-1',
    name: 'Parent Menu',
    slug: 'parent-menu',
    depth: 1,
    order: 1,
  });

  const child1 = createMockMenu({
    id: 'child-1',
    parentId: 'parent-1',
    name: 'Child Menu 1',
    slug: 'child-menu-1',
    depth: 2,
    order: 1,
    parent,
  });

  const child2 = createMockMenu({
    id: 'child-2',
    parentId: 'parent-1',
    name: 'Child Menu 2',
    slug: 'child-menu-2',
    depth: 2,
    order: 2,
    parent,
  });

  const grandchild = createMockMenu({
    id: 'grandchild-1',
    parentId: 'child-1',
    name: 'Grandchild Menu',
    slug: 'grandchild-menu',
    depth: 3,
    order: 1,
    parent: child1,
  });

  parent.children = [child1, child2];
  child1.children = [grandchild];
  child2.children = [];
  grandchild.children = [];

  return [parent, child1, child2, grandchild];
};

export const mockMenuRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
};

export const resetMocks = () => {
  Object.values(mockMenuRepository).forEach(mock => mock.mockReset());
};