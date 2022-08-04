declare module 'camunda-dmn-moddle/resources/camunda';
declare module 'styled-components';
declare module 'file-saver';
declare module 'diagram-js-minimap';
declare module 'dmn-js/lib/Modeler' {
    interface SaveSvgResult {
        svg: string;
    }

    interface SaveXmlOpts {
        format?: boolean;
    }

    export interface SaveXmlResult {
        xml: string;
    }

    export interface DmnModelerType {
        new (any);

        importXML: (string) => Promise<unknown>;
        saveSVG: () => Promise<SaveSvgResult>;
        saveXML: (opts: SaveXmlOpts, promise?: unknown) => Promise<SaveXmlResult>;
    }

    const DmnModeler: DmnModelerType;

    export default DmnModeler;
}
