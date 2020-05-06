import { groupBy, map } from "lodash";
import {
	Resolver,
	Arg,
	Query,
	Mutation,
	Ctx,
	FieldResolver,
	Root,
	Args,
} from "type-graphql";
import { Recipe, RecipeModel } from "../entities/Recipe";
import {
	RecipeCategory,
	RecipeCategoryModel,
} from "../entities/RecipeCategory";
import { User, UserModel } from "../entities/User";
import { CreateRecipeInput } from "../inputs/RecipeInput";
import { Context } from "../config/context";
import BedcaAPI from "../dataSources/BedcaAPI";
import { FoodItemInput } from "../inputs/FoodItemInput";
import { PaginationArgs } from "./PaginationArgs";

@Resolver((_of) => Recipe)
export default class RecipeResolver {
	@Query((_returns) => [Recipe], { nullable: false })
	recipes(@Args() { skip, limit }: PaginationArgs) {
		return RecipeModel.find().skip(skip).limit(limit).exec();
	}

	@Query((_returns) => Recipe, { nullable: true })
	recipe(@Arg("id") id: string) {
		return RecipeModel.findById(id).exec();
	}

	@Query((_returns) => [Recipe], { nullable: false })
	recipesByCategory(@Arg("input") categoryId: string) {
		return RecipeModel.find({ category_id: categoryId }).exec();
	}

	@Mutation((_returns) => Recipe, { nullable: false })
	async createRecipe(
		@Arg("input") recipeInput: CreateRecipeInput,
		@Ctx() { user, dataSources }: Context
	) {
		const foodValues = await recipeInfoHook(
			recipeInput.ingredients,
			dataSources.bedcaAPI
		);
		return RecipeModel.create({
			...recipeInput,
			userId: user,
			info: {
				name: recipeInput.title,
				foodValues: mergeFoodValues(foodValues),
			},
		});
	}

	@FieldResolver((_type) => RecipeCategory)
	category(@Root() recipe: any) {
		return RecipeCategoryModel.findById(recipe.categoryId);
	}

	@FieldResolver((_type) => User)
	user(@Root() recipe: any) {
		return UserModel.findById(recipe.userId);
	}
}

function mergeFoodValues(foodValues: any) {
	const totalReducer = (memo: any, value: any) => {
		return {
			...memo,
			total: memo.total + value.total,
		};
	};
	const grouped = groupBy(foodValues, (value) => value.id);

	return map(grouped, (group) => {
		return group.reduce(totalReducer, {
			bedcaId: group[0].bedcaId,
			name: group[0].name,
			unit: group[0].unit,
			total: 0,
		});
	});
}

function recipeInfoHook(ingredients: Array<FoodItemInput>, bedcaApi: BedcaAPI) {
	return Promise.all(
		ingredients.map((ingredient) =>
			bedcaApi
				.getFood(ingredient.id)
				.then((foodInfo) => foodInfo && foodInfo.foodValues)
		)
	).then((values) => values.flat());
}
