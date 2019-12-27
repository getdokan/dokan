<?php
namespace Snapshot;
use Codeception\Util\Locator;
class Products extends \Codeception\Snapshot
{

	public function __construct(\AcceptanceTester $I)
    {
        $this->i = $I;
    }

    protected function fetchData()
    {
        // TODO: return a value which will be used for snapshot
        // return $this->i->grabMultiple('div.dashboard-widget.big-counter'); 

        //In order details
        // return $this->i->grabMultiple('div.woocommerce_order_items_wrapper.wc-order-items-editable');  
        // return $this->i->grabMultiple(Locator::elementAt('//table/tbody/tr', 1)); 

        //Admin order details
        return $this->i->grabMultiple(Locator::firstElement('//table/tbody/tr')); 
    	
    }
}
