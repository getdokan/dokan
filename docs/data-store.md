## Dokan Model & Data Store Documentation

- [Data Model](#data-model)
- [Data Store](#data-store)
- [Uses of Models](#uses-of-models)

## Data Model

### Overview
The Dokan Data Model class should follow a structure similar to the `WC_Product` class, where the data layer is abstracted through the **Data Store**. This separation ensures that the model class is used throughout the Dokan plugin without interacting directly with the database or Data Store.

### Goal
The goal is to minimize the use of raw queries and enhance performance across various parts of the plugin. The data model should efficiently manage storing and retrieving data from the database.

### Implementation
The model class should extend the [\WeDevs\Dokan\Models\BaseModel](../includes/Models/BaseModel.php) class. It includes the following key properties and methods:

#### Properties
- `protected $object_type`: The type of object, such as `product`.
- `protected $data`: Holds the default data for the object.

#### Methods
- The `protected $data_store` property is initialized in the constructor.
- Getter and Setter methods use the `get_{key}` and `set_{key}` conventions, leveraging the `get_prop( $prop_name, $context )` and `set_prop( $prop_name, $prop_value )` methods for interacting with data properties.

Below is a sample class implementation:

```php
class Department extends \WeDevs\Dokan\Models\BaseModel {
    protected $object_type = 'department';

    protected $data = array(
        'name' => '',
        'date_created' => null,
        'date_updated' => null,
    );

    /**
     * Initialize the data store
     */
    public function __construct( int $item_id = 0 ) {
        parent::__construct( $item_id );
        $this->data_store = new \WeDevs\Dokan\Models\DataStore\DepartmentStore();

        if ( $this->get_id() > 0 ) {
            $this->data = $this->data_store->read( $this );
        }
    }

    public function get_name( $context = 'view' ) {
        return $this->get_prop('name', $context);
    }

    public function set_name( $name ) {
        return $this->set_prop( 'name', $name );
    }

    /**
     * @return \WC_DateTime|NULL Since the value was set by `set_date_prop` method
     */
    public function get_date_created( $context = 'view' ) {
        return $this->get_prop('date_created', $context);
    }

    /**
     * Set the date type value using the `set_date_prop` method.
     */ 
    public function set_date_created( $date_created ) {
        return $this->set_date_prop( 'date_created', $date_created );
    }

    /**
     * @return \WC_DateTime|NULL Since the value was set by `set_date_prop` method
     */
    public function get_date_updated( $context = 'view' ) {
        return $this->get_prop('date_updated', $context);
    }

    public function set_date_updated( $date_updated ) {
        return $this->set_date_prop( 'date_updated', $date_updated );
    }

    /**
     * Set the updated date for the entity.
     *
     * This method is protected to ensure that only internal code like `set_props` method
     * can set the updated date dynamically. External clients should use
     * the `set_date_created` and `set_date_updated` methods to manage dates semantically.
     *
     * @param string|int|DateTime $date_created
     */
    protected function set_updated_at( $date_updated ) {
        $this->set_date_updated( $date_updated );
    }
}
```

## Data Store

- [Override DB Date Format](#override-db-date-format)
- [Customizing the ID Field](#customizing-the-id-field)

Your data store class should extend the [\WeDevs\Dokan\Models\DataStore\BaseDataStore](../includes/Models/DataStore/BaseDataStore.php) class and must implement the following methods:

- `get_table_name`: Defines the table name in the database.
- `get_fields_with_format`: Returns the fields with format as an array where key is the db field name and value is the format..

Sample implementation:

```php
class DepartmentStore extends \WeDevs\Dokan\Models\DataStore\BaseDataStore {
    public function get_table_name(): string {
        return 'dokan_department';
    }

    public function get_fields_with_format(): array {
        return [
            'name' => '%s',
            'date_created' => '%s',
            'updated_at' => '%s',
        ];
    }

    public function get_date_updated( $context = 'view' ) {
        return $this->get_prop('date_updated', $context);
    }
}
```

### Override DB Date Format

The Data Store first checks for the existence of the `get_{field_name}` method to map the data during insert or update operations. There are two ways to override the DB date format:

**Option 1:**
Override the `get_date_format_for_field` method to specify a custom format.
```php
protected function get_date_format_for_field( string $db_field_name ): string  {
    return 'Y-m-d';
}
```

**Option 2:**
Create a custom method like `get_{db_field}` for more control over date formatting:
```php
protected function get_updated_at( Department $model, $context = 'edit' ): string {
    return $model->get_date_updated( $context )->date('Y-m-d');
}
```
> **Option 2** could be used to map the data during insert or update operations when Model's data key and Store's data key are different. 

### Customizing the ID Field

To customize the name and format of the ID field in the database, override the `get_id_field_name` and `get_id_field_format` methods. By default, the ID field is set to `id` and format is `%d`.

## Uses of Models

### Create a New Record
```php
$department = new Department();
$department->set_name('Department 1');
$department->save();
```

### Read a Record
```php
$department = new Department( $department_id );
echo $department->get_name();
```

### Update a Record
```php
$department = new Department( $department_id );
$department->set_name('Department 2');
$department->save();
```

### Case Study
Pls check the example [get_particulars](../includes/Models/VendorBalance.php#L16) & [set_perticulars](../includes/Models/VendorBalance.php#L146) methods of Model and  [get_perticulars](../includes/Models/DataStore/VendorBalanceStore.php#L35) method of Data Store.

`perticulars` field name  in database is *typo* but I don't want to expose public method `get_perticulars` in Model class instead of `get_particulars`.

We could do the same thing by overriding the following methods in Data Store.
- `protected function map_model_to_db_data( BaseModel &$model ): array`: Prepare data for saving a BaseModel to the database.
- `map_db_raw_to_model_data`: Maps database raw data to model data.