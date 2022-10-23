test('1+1=2', () => expect(1 + 1).toBe(2));

// import { Test, TestingModule } from '@nestjs/testing';
// import { anything, instance, mock, reset, when } from 'ts-mockito';
// import { Repository } from 'typeorm';
// import { Category } from './category.entity';
// import { CategoryService } from './category.service';

// describe('categoryService', () => {
//   let categoryService: CategoryService;

//   const categoryRepository: Repository<Category> = mock<Repository<Category>>();

//   beforeEach(async () => {
//     const instanceCategoryRepository = instance(categoryRepository);
//     const app: TestingModule = await Test.createTestingModule({
//       providers: [
//         {
//           provide: CategoryService,
//           useFactory: () => new CategoryService(instanceCategoryRepository),
//         },
//       ],
//     }).compile();

//     categoryService = app.get(CategoryService);
//   });

//   afterEach(async () => {
//     reset(categoryRepository);
//   });

//   describe('getAllCategories', () => {
//     it('return categories', async () => {});
//   });
// });
