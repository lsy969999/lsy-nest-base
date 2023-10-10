import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService
	){}

	signIn(){
		return "signIn"
	}

	signOut(){
		return "singOut"
	}

	regist(){
		return "signOut"
	}

	withdrawal(){
		return "withdrawal"
	}
}
