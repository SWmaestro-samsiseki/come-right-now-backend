import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @UseGuards(AuthGuard())
  getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }
}
