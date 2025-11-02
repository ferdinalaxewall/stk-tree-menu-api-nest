import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { MenuService } from '../../menu/menu.service';

export async function seedMenus() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const menuService = app.get(MenuService);

    try {
        console.log('🌱 Starting menu seeding...');

        const menuData = [
            {
                name: 'Dashboard',
                slug: 'dashboard',
                order: 0,
            },
            {
                name: 'Products',
                slug: 'products',
                order: 1,
            },
            {
                name: 'Orders',
                slug: 'orders',
                order: 2,
            },
            {
                name: 'Customers',
                slug: 'customers',
                order: 3,
            },
            {
                name: 'Reports',
                slug: 'reports',
                order: 4,
            },
            {
                name: 'Settings',
                slug: 'settings',
                order: 5,
            },
        ];

        const createdRootMenus = [];
        for (const menuItem of menuData) {
            const created = await menuService.create(menuItem);
            createdRootMenus.push(created);
            console.log(`✅ Created root menu: ${menuItem.name} (Order: ${menuItem.order})`);
        }

        const productsMenu = createdRootMenus.find(menu => menu.slug === 'products');
        const ordersMenu = createdRootMenus.find(menu => menu.slug === 'orders');
        const customersMenu = createdRootMenus.find(menu => menu.slug === 'customers');
        const reportsMenu = createdRootMenus.find(menu => menu.slug === 'reports');
        const settingsMenu = createdRootMenus.find(menu => menu.slug === 'settings');

        const subMenusData = [
            { name: 'All Products', slug: 'all-products', parentId: productsMenu?.id, order: 0 },
            { name: 'Add Product', slug: 'add-product', parentId: productsMenu?.id, order: 1 },
            { name: 'Categories', slug: 'categories', parentId: productsMenu?.id, order: 2 },
            { name: 'Inventory', slug: 'inventory', parentId: productsMenu?.id, order: 3 },

            { name: 'All Orders', slug: 'all-orders', parentId: ordersMenu?.id, order: 0 },
            { name: 'Pending Orders', slug: 'pending-orders', parentId: ordersMenu?.id, order: 1 },
            { name: 'Completed Orders', slug: 'completed-orders', parentId: ordersMenu?.id, order: 2 },
            { name: 'Cancelled Orders', slug: 'cancelled-orders', parentId: ordersMenu?.id, order: 3 },

            { name: 'All Customers', slug: 'all-customers', parentId: customersMenu?.id, order: 0 },
            { name: 'Customer Groups', slug: 'customer-groups', parentId: customersMenu?.id, order: 1 },

            { name: 'Sales Report', slug: 'sales-report', parentId: reportsMenu?.id, order: 0 },
            { name: 'Product Report', slug: 'product-report', parentId: reportsMenu?.id, order: 1 },
            { name: 'Customer Report', slug: 'customer-report', parentId: reportsMenu?.id, order: 2 },

            { name: 'General Settings', slug: 'general-settings', parentId: settingsMenu?.id, order: 0 },
            { name: 'User Management', slug: 'user-management', parentId: settingsMenu?.id, order: 1 },
            { name: 'System Settings', slug: 'system-settings', parentId: settingsMenu?.id, order: 2 },
        ];

        const createdSubMenus = [];
        for (const subMenuItem of subMenusData) {
            const created = await menuService.create(subMenuItem);
            createdSubMenus.push(created);
            console.log(`✅ Created sub-menu: ${subMenuItem.name} (Order: ${subMenuItem.order})`);
        }

        const categoriesMenu = createdSubMenus.find(menu => menu.slug === 'categories');
        const userManagementMenu = createdSubMenus.find(menu => menu.slug === 'user-management');

        const thirdLevelMenusData = [
            { name: 'Electronics', slug: 'electronics', parentId: categoriesMenu?.id, order: 0 },
            { name: 'Clothing', slug: 'clothing', parentId: categoriesMenu?.id, order: 1 },
            { name: 'Books', slug: 'books', parentId: categoriesMenu?.id, order: 2 },
            { name: 'Home & Garden', slug: 'home-garden', parentId: categoriesMenu?.id, order: 3 },

            { name: 'All Users', slug: 'all-users', parentId: userManagementMenu?.id, order: 0 },
            { name: 'Roles & Permissions', slug: 'roles-permissions', parentId: userManagementMenu?.id, order: 1 },
            { name: 'User Groups', slug: 'user-groups', parentId: userManagementMenu?.id, order: 2 },
        ];

        for (const thirdLevelMenuItem of thirdLevelMenusData) {
            await menuService.create(thirdLevelMenuItem);
            console.log(`✅ Created third-level menu: ${thirdLevelMenuItem.name} (Order: ${thirdLevelMenuItem.order})`);
        }

        console.log('🎉 Menu seeding completed successfully!');
        console.log(`📊 Total created: ${menuData.length} root menus, ${subMenusData.length} sub-menus, ${thirdLevelMenusData.length} third-level menus`);

    } catch (error) {
        console.error('❌ Error during menu seeding:', error);
        throw error;
    } finally {
        await app.close();
    }
}

if (require.main === module) {
    seedMenus()
        .then(() => {
            console.log('✅ Seeding process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding process failed:', error);
            process.exit(1);
        });
}