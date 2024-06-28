
import { Controller, Post, Body, Get, Param, Put, Delete, HttpException, HttpStatus, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.usersService.register(registerDto.email, registerDto.password, registerDto.username);
      return { id: user.id, email: user.email, username: user.username };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return { id: user.id, email: user.email, username: user.username };
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
      if (error instanceof NotFoundException) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.usersService.remove(id);
      return { message: 'User removed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to remove user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
