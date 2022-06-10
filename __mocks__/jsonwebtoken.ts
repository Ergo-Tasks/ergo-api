import jwt from 'jsonwebtoken'

import { JsonWebTokenError } from 'jsonwebtoken';
import { jwtPayload } from '../src/middleware/auth'

type MockToken = 'valid' | 'invalid';

type Callback = (err: Error | undefined, decoded: jwtPayload | undefined) => {}

const verify = (token: MockToken, secretOrPublicKey: string, callback: Callback) => {

	if (token === 'valid') {

		callback(undefined, {
			email: 'kaydengr@uw.edu',
			id: '1'
		});

	} else {
		callback(new Error(), undefined);
	}

}

export default { ...jwt, verify };