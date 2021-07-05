Feature: Simple Product Order Management
    In order to purchae product
    As an Admin and Vendor
    I need to be able to check balance are updated properly
# As 
# I want 
# So that 

@single_order
Scenario: Single Order Single Vendor
    Given Existing balance of Admin will be checked
    When Customer purchase a simple product
    Then Admin balance and commission will be checked
    And Vendors Existing Balance will be checked and approve order status to comeplete
    And Vendor balance will update with addition of new order earning amount
