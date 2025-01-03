import { StatusElement } from './Status';
import Section from './Elements/Section';
import SubSection from './Elements/SubSection';
import Heading from './Elements/Heading';
import Table from './Elements/Table';
import TableRow from './Elements/TableRow';
import TableColumn from './Elements/TableColumn';
import Paragraph from './Elements/Paragraph';
import Link from './Elements/Link';
import Button from './Elements/Button';

const SettingsParser = ( { element }: { element: StatusElement } ) => {
    switch ( element.type ) {
        case 'section':
            return <Section key={ element.hook_key } element={ element } />;
        case 'sub-section':
            return <SubSection key={ element.hook_key } element={ element } />;
        case 'table':
            return <Table key={ element.hook_key } element={ element } />;
        case 'table-row':
            return <TableRow key={ element.hook_key } element={ element } />;
        case 'table-column':
            return <TableColumn key={ element.hook_key } element={ element } />;
        case 'heading':
            return <Heading key={ element.hook_key } element={ element } />;
        case 'paragraph':
            return <Paragraph key={ element.hook_key } element={ element } />;
        case 'link':
            return <Link key={ element.hook_key } element={ element } />;
        case 'button':
            return <Button key={ element.hook_key } element={ element } />;

        default:
            return <></>;
    }
};

export default SettingsParser;
