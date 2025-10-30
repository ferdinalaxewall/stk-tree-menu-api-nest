import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
    ) {}

  async create(dto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(dto);
    if (dto.parentId) {
        const parent = await this.menuRepository.findOne({
            where: { id: dto.parentId },
        });

        if (!parent) throw new NotFoundException('Parent menu not found');
        menu.depth = parent.depth + 1;
    } else {
        menu.depth = 1;
    }

    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
        relations: ['children'],
        order: { order : 'ASC' }
    })

    return this.buildTree(menus);
  }

  private buildTree(menus: Menu[], parentId: string | null = null): Menu[] {
    return menus
        .filter(menu => menu.parentId === parentId)
        .map(menu => ({
            ...menu,
            children: this.buildTree(menus, menu.id)
        }));
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
        where: { id: id },
        relations: ['children'],
    });

    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);

    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }
}
