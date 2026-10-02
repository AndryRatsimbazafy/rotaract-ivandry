import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import type { Paginated } from '../common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';
import type { AdminMemberDetailView, AdminMemberView } from './members.service';

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class MembersAdminController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(
    @Query() query: QueryMembersDto,
  ): Promise<Paginated<AdminMemberView>> {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<AdminMemberDetailView> {
    return this.membersService.findOne(id);
  }

  @Post()
  create(@Body() createMemberDto: CreateMemberDto): Promise<AdminMemberView> {
    return this.membersService.create(createMemberDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<AdminMemberView> {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.membersService.remove(id);
  }
}
