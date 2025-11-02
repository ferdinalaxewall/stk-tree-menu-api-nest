import { DataSource } from 'typeorm';
import { Menu } from '../../menu/entities/menu.entity';

export class MenuSeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const menuRepository = dataSource.getRepository(Menu);

        await menuRepository.delete({});

        // Sample menu data with hierarchical structure
        const menuData = [
            {
                name: 'Dashboard',
                slug: 'dashboard',
                parentId: null,
                depth: 1,
                order: 1,
            },
            {
                name: 'Products',
                slug: 'products',
                parentId: null,
                depth: 1,
                order: 2,
            },
            {
                name: 'Orders',
                slug: 'orders',
                parentId: null,
                depth: 1,
                order: 3,
            },
            {
                name: 'Customers',
                slug: 'customers',
                parentId: null,
                depth: 1,
                order: 4,
            },
            {
                name: 'Reports',
                slug: 'reports',
                parentId: null,
                depth: 1,
                order: 5,
            },
            {
                name: 'Settings',
                slug: 'settings',
                parentId: null,
                depth: 1,
                order: 6,
            },
        ];

        const rootMenus = await menuRepository.save(menuData);

        const productsMenu = rootMenus.find(menu => menu.slug === 'products');
        const ordersMenu = rootMenus.find(menu => menu.slug === 'orders');
        const customersMenu = rootMenus.find(menu => menu.slug === 'customers');
        const reportsMenu = rootMenus.find(menu => menu.slug === 'reports');
        const settingsMenu = rootMenus.find(menu => menu.slug === 'settings');

        const subMenuData = [
            {
                name: 'All Products',
                slug: 'all-products',
                parentId: productsMenu?.id,
                depth: 2,
                order: 1,
            },
            {
                name: 'Add Product',
                slug: 'add-product',
                parentId: productsMenu?.id,
                depth: 2,
                order: 2,
            },
            {
                name: 'Categories',
                slug: 'categories',
                parentId: productsMenu?.id,
                depth: 2,
                order: 3,
            },
            {
                name: 'Inventory',
                slug: 'inventory',
                parentId: productsMenu?.id,
                depth: 2,
                order: 4,
            },

            {
                name: 'All Orders',
                slug: 'all-orders',
                parentId: ordersMenu?.id,
                depth: 2,
                order: 1,
            },
            {
                name: 'Pending Orders',
                slug: 'pending-orders',
                parentId: ordersMenu?.id,
                depth: 2,
                order: 2,
            },
            {
                name: 'Completed Orders',
                slug: 'completed-orders',
                parentId: ordersMenu?.id,
                depth: 2,
                order: 3,
            },
            {
                name: 'Cancelled Orders',
                slug: 'cancelled-orders',
                parentId: ordersMenu?.id,
                depth: 2,
                order: 4,
            },

            {
                name: 'All Customers',
                slug: 'all-customers',
                parentId: customersMenu?.id,
                depth: 2,
                order: 1,
            },
            {
                name: 'Customer Groups',
                slug: 'customer-groups',
                parentId: customersMenu?.id,
                depth: 2,
                order: 2,
            },

            {
                name: 'Sales Report',
                slug: 'sales-report',
                parentId: reportsMenu?.id,
                depth: 2,
                order: 1,
            },
            {
                name: 'Product Report',
                slug: 'product-report',
                parentId: reportsMenu?.id,
                depth: 2,
                order: 2,
            },
            {
                name: 'Customer Report',
                slug: 'customer-report',
                parentId: reportsMenu?.id,
                depth: 2,
                order: 3,
            },

            {
                name: 'General Settings',
                slug: 'general-settings',
                parentId: settingsMenu?.id,
                depth: 2,
                order: 1,
            },
            {
                name: 'User Management',
                slug: 'user-management',
                parentId: settingsMenu?.id,
                depth: 2,
                order: 2,
            },
            {
                name: 'System Settings',
                slug: 'system-settings',
                parentId: settingsMenu?.id,
                depth: 2,
                order: 3,
            },
        ];

        const subMenus = await menuRepository.save(subMenuData);

        const categoriesMenu = subMenus.find(menu => menu.slug === 'categories');
        const userManagementMenu = subMenus.find(menu => menu.slug === 'user-management');

        const thirdLevelMenuData = [
            {
                name: 'Electronics',
                slug: 'electronics',
                parentId: categoriesMenu?.id,
                depth: 3,
                order: 1,
            },
            {
                name: 'Clothing',
                slug: 'clothing',
                parentId: categoriesMenu?.id,
                depth: 3,
                order: 2,
            },
            {
                name: 'Books',
                slug: 'books',
                parentId: categoriesMenu?.id,
                depth: 3,
                order: 3,
            },
            {
                name: 'Home & Garden',
                slug: 'home-garden',
                parentId: categoriesMenu?.id,
                depth: 3,
                order: 4,
            },

            {
                name: 'All Users',
                slug: 'all-users',
                parentId: userManagementMenu?.id,
                depth: 3,
                order: 1,
            },
            {
                name: 'Roles & Permissions',
                slug: 'roles-permissions',
                parentId: userManagementMenu?.id,
                depth: 3,
                order: 2,
            },
            {
                name: 'User Groups',
                slug: 'user-groups',
                parentId: userManagementMenu?.id,
                depth: 3,
                order: 3,
            },
        ];

        // Insert third-level menus
        await menuRepository.save(thirdLevelMenuData);

        console.log('✅ Menu seeding completed successfully!');
        console.log(`📊 Created ${menuData.length} root menus, ${subMenuData.length} sub-menus, and ${thirdLevelMenuData.length} third-level menus`);
    }
}