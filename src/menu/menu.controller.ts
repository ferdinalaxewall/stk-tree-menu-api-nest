import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus items (tree structure)' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu item by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu item by ID' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
