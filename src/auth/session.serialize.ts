import { Injectable } from "@nestjs/common"
import { PassportSerializer } from "@nestjs/passport"

@Injectable()
export class SessionSerializer extends PassportSerializer {
	serializeUser(user, done): any { // what to save to session store after a cycle end
		done(null, user)
	}

	deserializeUser(user, done) { // what to write to req.user on a cycle
		done(null, user)
	}
}