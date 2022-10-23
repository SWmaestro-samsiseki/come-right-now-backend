import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { anyString, anything, instance, mock, reset, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

describe('categoryService', () => {
  let categoryService: CategoryService;

  const categoryRepository: Repository<Category> = mock<Repository<Category>>();

  beforeEach(async () => {
    const instanceCategoryRepository = instance(categoryRepository);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CategoryService,
          useFactory: () => new CategoryService(instanceCategoryRepository),
        },
      ],
    }).compile();

    categoryService = app.get(CategoryService);
  });

  afterEach(async () => {
    reset(categoryRepository);
  });

  describe('getAllCategories', () => {
    it('return categories', async () => {
      const id1 = 0;
      const name1 = 'test1';
      const image1 = 'test1';
      const c1 = new Category();
      c1.id = id1;
      c1.name = name1;
      c1.image = image1;
      const id2 = 1;
      const name2 = 'test2';
      const image2 = 'test2';
      const c2 = new Category();
      c2.id = id2;
      c2.name = name2;
      c2.image = image2;
      const categories: Category[] = [c1, c2];
      when(categoryRepository.find(anything())).thenResolve(categories);

      const result = await categoryService.getAllCategories();

      expect(result[0]).toBe(c1);
      expect(result[1]).toBe(c2);
    });

    it('throw Not Found Exception if no categories', async () => {
      when(categoryRepository.find(anything())).thenThrow(new NotFoundException());

      try {
        await categoryService.getAllCategories();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
