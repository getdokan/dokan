<?php

/**
 * Lists all depricated classes
 */
class Dokan_Depricated_Classes {

    public function __construct() {
        $dir_path = DOKAN_INC_DIR . '/depricated';

        require_once $dir_path . '/abstract-class-dokan-background-processes.php';
    }
}

new Dokan_Depricated_Classes();
