import { CreateMenuDto } from '../menu/dto/create-menu.dto';
import { UpdateMenuDto } from '../menu/dto/update-menu.dto';

export const validCreateMenuDto: CreateMenuDto = {
  name: 'Test Menu',
  slug: 'test-menu',
  parentId: null,
  depth: 1,
  order: 1,
};

export const validCreateChildMenuDto: CreateMenuDto = {
  name: 'Child Menu',
  slug: 'child-menu',
  parentId: 'parent-id',
  depth: 2,
  order: 1,
};

export const invalidCreateMenuDto = {
  name: '', // Invalid: empty name
  slug: 123, // Invalid: should be string
  depth: 0, // Invalid: should be >= 1
  order: -1, // Invalid: negative order
};

export const validUpdateMenuDto: UpdateMenuDto = {
  name: 'Updated Menu Name',
  slug: 'updated-menu-slug',
};

export const menuTestCases = {
  validInputs: [
    {
      name: 'Simple Menu',
      slug: 'simple-menu',
    },
    {
      name: 'Menu with Parent',
      slug: 'menu-with-parent',
      parentId: 'parent-id',
    },
    {
      name: 'Menu with Special Characters',
      slug: 'menu-with-special-chars',
    },
  ],
  invalidInputs: [
    {
      name: '',
      slug: 'empty-name',
      expectedError: 'name should not be empty',
    },
    {
      name: 'Valid Name',
      slug: '',
      expectedError: 'slug should not be empty',
    },
    {
      name: 'Valid Name',
      slug: 'valid-slug',
      depth: 0,
      expectedError: 'depth must not be less than 1',
    },
  ],
};

export const edgeCases = {
  deepNesting: {
    maxDepth: 10,
    menuChain: Array.from({ length: 10 }, (_, i) => ({
      id: `menu-${i + 1}`,
      name: `Menu Level ${i + 1}`,
      slug: `menu-level-${i + 1}`,
      depth: i + 1,
      parentId: i === 0 ? null : `menu-${i}`,
    })),
  },
  largeOrderNumbers: {
    maxOrder: 1000,
    siblings: Array.from({ length: 100 }, (_, i) => ({
      id: `sibling-${i + 1}`,
      name: `Sibling ${i + 1}`,
      slug: `sibling-${i + 1}`,
      order: i + 1,
      parentId: 'parent-id',
    })),
  },
};

export const errorScenarios = {
  notFound: {
    menuId: 'non-existent-id',
    parentId: 'non-existent-parent-id',
  },
  duplicateSlug: {
    existingSlug: 'existing-slug',
  },
  circularReference: {
    parentId: 'child-id',
    childId: 'parent-id',
  },
};