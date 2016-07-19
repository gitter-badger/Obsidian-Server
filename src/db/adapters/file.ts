/**
 * File Adapter
 * 
 * Copyright (C) TENDIGI, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nick Lee <nick@tendigi.com>, June 2015
 * 
 */

import Path = require('path');
import Joi = require('joi');
let Untildify = require('untildify');

import Adapter = require('./adapter');
import Environment = require('../../config/environment');

class File extends Adapter {

	// Private members
	private static schema = Joi.object({
		type: Joi.string().valid('file'),
		options: Joi.object().required().keys({
			directory: Joi.string().min(1).required()
		})
	});

	// Initialization
	constructor(environment: Environment, connectionName: string, config: {}) {
		super(environment, connectionName, config);

		let validationResult = Joi.validate(config, File.schema);

		if (validationResult.error) {
			throw validationResult.error;
		}

		this._adapterName = 'file';
		this._adapter = this.shimAdapter();

		let base = validationResult.value['options']['directory'];
		let joined = Path.join(environment.directory, base);
		let path = Untildify(joined);
		
		this._options = {
			filePath: path,
			schema: true	
		};
	}
	
	// Shimming
	private shimAdapter(): any {
		let adapter = require('sails-disk');
		return adapter;
	}
	
}

export = File;