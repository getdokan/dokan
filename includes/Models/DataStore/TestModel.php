<?php

namespace WeDevs\Dokan\DataStore;

use WeDevs\Dokan\DataStore\Model;

class TestModel extends Model {

    protected string $object_type = 'test'; // Change it. it your store object type.

	/**
	 * @inheritDoc
	 */
	public function get(): Model {
		// TODO: Implement get() method.
	}

	/**
	 * @inheritDoc
	 */
	public function create(): Model {
		// TODO: Implement create() method.
	}

	/**
	 * @inheritDoc
	 */
	public function update(): Model {
		// TODO: Implement update() method.
	}

	/**
	 * @inheritDoc
	 */
	public function delete(): bool {
		// TODO: Implement delete() method.
	}
}
