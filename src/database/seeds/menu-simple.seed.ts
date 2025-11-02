import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { MenuService } from '../../menu/menu.service';

export async function seedMenus() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const menuService = app.get(MenuService);

    try {
        console.log('🌱 Starting menu seeding...');

        // Sample menu data with hierarchical structure
        const menuData = [
            {
                name: 'Dashboard',
                slug: 'dashboard',
            },
            {
                name: 'Products',
                slug: 'products',
            },
            {
                name: 'Orders',
                slug: 'orders',
            },
            {
                name: 'Customers',
                slug: 'customers',
            },
            {
                name: 'Reports',
                slug: 'reports',
            },
            {
                name: 'Settings',
                slug: 'settings',
            },
        ];

        const createdRootMenus = [];
        for (const menuItem of menuData) {
            const created = await menuService.create(menuItem);
            createdRootMenus.push(created);
            console.log(`✅ Created root menu: ${menuItem.name}`);
        }

        const productsMenu = createdRootMenus.find(menu => menu.slug === 'products');
        const ordersMenu = createdRootMenus.find(menu => menu.slug === 'orders');
        const customersMenu = createdRootMenus.find(menu => menu.slug === 'customers');
        const reportsMenu = createdRootMenus.find(menu => menu.slug === 'reports');
        const settingsMenu = createdRootMenus.find(menu => menu.slug === 'settings');

        const subMenusData = [
            { name: 'All Products', slug: 'all-products', parentId: productsMenu?.id },
            { name: 'Add Product', slug: 'add-product', parentId: productsMenu?.id },
            { name: 'Categories', slug: 'categories', parentId: productsMenu?.id },
            { name: 'Inventory', slug: 'inventory', parentId: productsMenu?.id },

            { name: 'All Orders', slug: 'all-orders', parentId: ordersMenu?.id },
            { name: 'Pending Orders', slug: 'pending-orders', parentId: ordersMenu?.id },
            { name: 'Completed Orders', slug: 'completed-orders', parentId: ordersMenu?.id },
            { name: 'Cancelled Orders', slug: 'cancelled-orders', parentId: ordersMenu?.id },

            { name: 'All Customers', slug: 'all-customers', parentId: customersMenu?.id },
            { name: 'Customer Groups', slug: 'customer-groups', parentId: customersMenu?.id },

            { name: 'Sales Report', slug: 'sales-report', parentId: reportsMenu?.id },
            { name: 'Product Report', slug: 'product-report', parentId: reportsMenu?.id },
            { name: 'Customer Report', slug: 'customer-report', parentId: reportsMenu?.id },

            { name: 'General Settings', slug: 'general-settings', parentId: settingsMenu?.id },
            { name: 'User Management', slug: 'user-management', parentId: settingsMenu?.id },
            { name: 'System Settings', slug: 'system-settings', parentId: settingsMenu?.id },
        ];

        const createdSubMenus = [];
        for (const subMenuItem of subMenusData) {
            const created = await menuService.create(subMenuItem);
            createdSubMenus.push(created);
            console.log(`✅ Created sub-menu: ${subMenuItem.name}`);
        }

        const categoriesMenu = createdSubMenus.find(menu => menu.slug === 'categories');
        const userManagementMenu = createdSubMenus.find(menu => menu.slug === 'user-management');

        const thirdLevelMenusData = [
            { name: 'Electronics', slug: 'electronics', parentId: categoriesMenu?.id },
            { name: 'Clothing', slug: 'clothing', parentId: categoriesMenu?.id },
            { name: 'Books', slug: 'books', parentId: categoriesMenu?.id },
            { name: 'Home & Garden', slug: 'home-garden', parentId: categoriesMenu?.id },

            { name: 'All Users', slug: 'all-users', parentId: userManagementMenu?.id },
            { name: 'Roles & Permissions', slug: 'roles-permissions', parentId: userManagementMenu?.id },
            { name: 'User Groups', slug: 'user-groups', parentId: userManagementMenu?.id },
        ];

        for (const thirdLevelMenuItem of thirdLevelMenusData) {
            await menuService.create(thirdLevelMenuItem);
            console.log(`✅ Created third-level menu: ${thirdLevelMenuItem.name}`);
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

// Run seeding if this file is executed directly
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