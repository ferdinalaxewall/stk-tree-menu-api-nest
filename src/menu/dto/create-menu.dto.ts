import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateMenuDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    parentId?: string | null;

    @IsOptional()
    @IsInt()
    @Min(1)
    depth?: number;

    @IsOptional()
    @IsInt()
    order?: number;
}
