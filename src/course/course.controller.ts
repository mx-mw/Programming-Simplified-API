/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Put, UseGuards, Request, HttpCode, Get, Post, Req } from '@nestjs/common';
import EnrollDto from 'src/dto/enroll.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt.guard';
import { UserCourse } from 'src/schemas/userCourse.schema';
import { UsersService } from 'src/users/users.service';
import { CourseService } from './course.service';

@Controller('course')
export class CourseController {
	constructor(private courseService: CourseService, private usersService: UsersService) { }

	@Post('progress')
	async postProgress(@Req() req, @Body() data) {
		const user = await this.usersService.findOneByEmail(req.user.email);
		await this.courseService.progress(
			user.email,
			data.courseId,
			data.lessonId-1,
			data.progress
		);
	}

	@Put('enroll')
	@HttpCode(201)
	@UseGuards(JwtAuthGuard)
	async enroll(@Request() req, @Body() addCourseDto: EnrollDto) {
		await this.courseService.enroll(req.user.email, addCourseDto);
	}

	@Get('progress')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async getProgress(@Request() req) {
		const user = await this.courseService.findOne_User(req.email);
		const courses = user.courses;

		const lessons: Map<UserCourse, Record<string, any>> = new Map();
		courses.forEach(i => i.lessons.forEach(j => lessons.set(i, j)));

		const notCompleted = courses.filter(course => course.status != 2);
		const nextLessons = new Array<Record<string, any>>();
		notCompleted.forEach(course => nextLessons.push(course.lessons.find(lesson => lesson.progress < 100)));

	}

	// @Put('newCourse')
	// async newCourse(@Body() course: Course) {
	// 	await this.courseService.newCourse(course);
	// }
}
