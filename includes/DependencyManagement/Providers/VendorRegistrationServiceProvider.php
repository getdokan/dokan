<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\VendorRegistration\AnswersAdmin;
use WeDevs\Dokan\VendorRegistration\AnswersSettingsTab;
use WeDevs\Dokan\VendorRegistration\Block;
use WeDevs\Dokan\VendorRegistration\CustomerUpgrade;
use WeDevs\Dokan\VendorRegistration\EditorData;
use WeDevs\Dokan\VendorRegistration\FieldIndex;
use WeDevs\Dokan\VendorRegistration\FieldRegistry;
use WeDevs\Dokan\VendorRegistration\FormRenderer;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WeDevs\Dokan\VendorRegistration\MyAccountForm;
use WeDevs\Dokan\VendorRegistration\SettingsHints;
use WeDevs\Dokan\VendorRegistration\Submission;
use WeDevs\Dokan\VendorRegistration\VendorAnswers;

/**
 * Registers the vendor registration form services with the container.
 *
 * @since DOKAN_SINCE
 */
class VendorRegistrationServiceProvider extends BaseServiceProvider {

    protected $tags = [ 'vendor-registration-service' ];

    /**
     * List of services provided by this provider.
     *
     * @var array
     */
    protected $services = [
        FieldRegistry::class,
        FormSetup::class,
        FormRenderer::class,
        Block::class,
        Submission::class,
        CustomerUpgrade::class,
        EditorData::class,
        FieldIndex::class,
        MyAccountForm::class,
        VendorAnswers::class,
        AnswersAdmin::class,
        AnswersSettingsTab::class,
        SettingsHints::class,
    ];

    /**
     * Register the services with the dependency container.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        $this->add_tags( $this->share_with_implements_tags( FieldRegistry::class ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( FormSetup::class )->addArgument( FieldRegistry::class ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( FormRenderer::class )->addArgument( FormSetup::class ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( Block::class )->addArguments( [ FormRenderer::class, FormSetup::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( Submission::class )->addArguments( [ FormSetup::class, FormRenderer::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( CustomerUpgrade::class )->addArgument( Submission::class ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( EditorData::class )->addArguments( [ FieldRegistry::class, FormRenderer::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( FieldIndex::class )->addArguments( [ FormSetup::class, FieldRegistry::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( MyAccountForm::class )->addArguments( [ FormSetup::class, FormRenderer::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( VendorAnswers::class )->addArguments( [ FormSetup::class, Submission::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( AnswersAdmin::class )->addArguments( [ VendorAnswers::class, Submission::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( AnswersSettingsTab::class )->addArguments( [ VendorAnswers::class, Submission::class ] ), $this->tags );
        $this->add_tags( $this->share_with_implements_tags( SettingsHints::class )->addArgument( FormSetup::class ), $this->tags );
    }
}
