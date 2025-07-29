import React from 'react';
import { SocialButton } from '../../../../../../components/fields';

export default function DokanSocialButton( { element, onClick } ) {
    if ( ! element.display ) {
        return null;
    }

    return (
        <SocialButton
            network={ element.network }
            label={ element.title }
            onClick={ onClick }
            disabled={ element.disabled }
        />
    );
}
