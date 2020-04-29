import { Resolver, Mutation, Arg, FieldResolver, Root } from "type-graphql";
import {
	RecipeCategory,
	RecipeCategoryModel,
} from "../entities/RecipeCategory";
import { CreateRecipeCategoryInput } from "../inputs/RecipeCategory";

@Resolver(() => RecipeCategory)
export default class RecipeCategoryResolver {
	@Mutation((_returns) => RecipeCategory, { nullable: false })
	async createRecipeCategory(
		@Arg("input") categoryInput: CreateRecipeCategoryInput
	) {
		return RecipeCategoryModel.create(categoryInput);
	}

	@FieldResolver()
	id(@Root() recipeCategory: any) {
		return recipeCategory._id;
	}
}
