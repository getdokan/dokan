// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DokanButton } from '@dokan/components';
import { __ } from '@wordpress/i18n';

type ImporterProps = {
    progress: number;
    loading: boolean;
    onRun: () => void;
};

function Importer( { progress, loading, onRun }: ImporterProps ) {
    return (
        <div className="p-[24px]">
            <div className="flex flex-col gap-[24px]">
                <div>
                    <h2 className="font-[700] text-[18px] text-[#25252D] mb-[10px]">
                        { __( 'Data Importer', 'dokan-lite' ) }
                    </h2>
                    <p className="font-[400] text-[14px] text-[#828282]">
                        { __(
                            'Normally it takes less than 1 minute.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                <div className="flex flex-row gap-[16px] items-center my-[4px]">
                    <progress
                        className="w-full h-[8px] [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-[#EFEAFF] [&::-webkit-progress-value]:bg-[#7047EB] [&::-webkit-progress-value]:transition-[width_0.5s] [&::-moz-progress-bar]:bg-[#7047EB]"
                        value={ Math.round( progress ) }
                        max={ 100 }
                    />
                    <span>{ Math.round( progress ) }%</span>
                </div>

                <div>
                    <DokanButton
                        disabled={ loading }
                        loading={ loading }
                        onClick={ onRun }
                        label={ __( 'Run the Importer', 'dokan-lite' ) }
                        className="!h-[28px] !font-[500] !text-[12px] !leading-[16px]"
                    />
                </div>
            </div>
        </div>
    );
}

export default Importer;
