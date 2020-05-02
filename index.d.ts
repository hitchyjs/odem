import {HitchyAPI, HitchyModelComponent, HitchyServiceComponent} from "hitchy";
import { Readable } from "stream";

export = HitchyOdem;

declare namespace HitchyOdem {
    interface OdemAdapter {

    }

    class OdemAdapterMemory implements OdemAdapter, HitchyServiceComponent {
        constructor( options?: OdemAdapterMemoryOptions );
    }

    interface OdemAdapterMemoryOptions {
    }

    class OdemAdapterFile implements OdemAdapter, HitchyServiceComponent {
        constructor( options: OdemAdapterFileOptions );
    }

    interface OdemAdapterFileOptions {
        /** Picks folder for containing persisted data on local file system. */
        dataSource: string;
    }

    type UuidValue = string | Buffer;

    /**
     * Defines how to act on changing an instance's property without saving
     * first.
     */
    enum OdemModelOptionOnUnsaveEnum {
        /** Reject change of property and log message to stderr. */
        FAIL = "fail",
        /** Accept change of property, but log message to stderr. */
        WARN = "warn",
        /** Accept change of property, don't log anything. */
        IGNORE = "ignore"
    }

    interface ModelOptions {
        onUnsaved?: OdemModelOptionOnUnsaveEnum;
    }

    interface ModelSchema extends ModelSchemaDefinition {

    }

    interface ModelSchemaDefinition {
        name?: string;
        props: { [ key: string ]: ModelPropertyDefinition };
        computed?: { [ key: string ]: Function };
        methods?: { [ key: string ]: Function };
        hooks?: LifeCycleHooks;
        options?: ModelOptions;
        indices?: { [ key: string ]: ModelIndexDefinition };
    }

    interface ModelPropertyDefaultDefinition {
        /** Constraints property to always have non-nullish value. */
        required?: boolean;
        /** Defines value to assign on creating new item. */
        default?: any;
        index?: ModelIndexDefinition;
    }

    interface ModelPropertyStringDefinition extends ModelPropertyDefaultDefinition {
        type?: "string";
        /** Controls whether auto-trimming values or not. */
        trim?: boolean;
        /** Controls whether reducing any sequence of whitespace to single SPC or not. */
        reduceSpace?: boolean;
        /** Controls whether converting all letters to lowercase or not. */
        lowerCase?: boolean;
        /** Controls whether converting all letters to uppercase or not. */
        upperCase?: boolean;
        /** Constraints property values to have this number of characters at least. */
        minLength?: number;
        /** Constraints property values to have this number of characters at most. */
        maxLength?: number;
        /** Constraints property values to match this pattern. */
        pattern?: RegExp | string;
    }

    interface ModelPropertyNumberDefinition extends ModelPropertyDefaultDefinition {
        type: "number" | "numeric" | "decimal" | "float";
        /** Constraints values of property to snap to multitudes of this value starting at `min`. */
        step?: number;
        /** Constraints values of property to be greater than or equal this value. */
        min?: number;
        /** Constraints values of property to be less than or equal this value. */
        max?: number;
    }

    interface ModelPropertyIntegerDefinition extends ModelPropertyDefaultDefinition {
        type: "integer";
        /** Constraints values of property to snap to multitudes of this value starting at `min`. */
        step?: number;
        /** Constraints values of property to be greater than or equal this value. */
        min?: number;
        /** Constraints values of property to be less than or equal this value. */
        max?: number;
    }

    interface ModelPropertyBooleanDefinition extends ModelPropertyDefaultDefinition {
        type: "boolean";
        /** Constraints value to be set for passing validation. */
        isSet?: boolean;
    }

    interface ModelPropertyTimestampDefinition extends ModelPropertyDefaultDefinition {
        type: "date" | "time";
        /** Controls whether including day of time with values or stripping it off. */
        time?: boolean;
        /** Constraints values of property to snap to multitudes of this value in milliseconds starting at `min`. */
        step?: number;
        /** Constraints values of property to be at this timestamp at least. */
        min?: number;
        /** Constraints values of property to be at this timestamp at most. */
        max?: number;
    }

    interface ModelPropertyUuidDefinition extends ModelPropertyDefaultDefinition {
        type: "uuid" | "key";
    }

    type ModelPropertyDefinition = ModelPropertyStringDefinition | ModelPropertyNumberDefinition |
        ModelPropertyIntegerDefinition | ModelPropertyBooleanDefinition |
        ModelPropertyTimestampDefinition | ModelPropertyUuidDefinition;

    type ModelIndexSimpleDefinition = true | string | string[];
    type ModelIndexReducerDefinition = ( value: any ) => any;

    interface ModelIndexComputedDefinition {
        propertyType: string;
    }

    type ModelIndexComplexDefinition = { [ key: string ]: ModelIndexSimpleDefinition | ModelIndexReducerDefinition | ModelIndexComputedDefinition }

    type ModelIndexDefinition = ModelIndexSimpleDefinition | ModelIndexReducerDefinition | ModelIndexComplexDefinition;

    interface PartialListOptions {
        /** Controls number of items to skip on fetching list of items. [default: 0]*/
        offset?: number;

        /** Controls number of items to fetch at most. [default: Infinity]*/
        limit?: number;
    }

    interface ListOptions extends PartialListOptions {
        /** Names property for use with sorting all resulting records. */
        sortBy?: string;

        /** Controls whether resulting items are sorted by given property in ascending or in descending order. */
        sortAscendingly?: boolean;
    }

    interface DataOptions {
        /** Provides context for passing back number of totally matching records. */
        metaCollector?: MetaCollector;

        /** Controls whether loading all matching models' properties (significantly affecting performance). [default: false] */
        loadRecords?: boolean;
    }

    interface MetaCollector {
        count?: number;
    }

    interface BeforeCreateInformation {
        uuid?: UuidValue;
        options: ModelOptions;
    }

    interface UnaryQueryOptions {
        name: string;
    }

    interface BinaryQueryOptions {
        name: string;
        value: any;
    }

    interface RangeQueryOptions {
        name: string;
        lower?: number | string;
        upper?: number | string;
    }

    type UnaryQuery = { [ key: string ]: UnaryQueryOptions };
    type BinaryQuery = { [ key: string ]: BinaryQueryOptions };
    type RangeQuery = { [ key: string ]: RangeQueryOptions };

    type Query = UnaryQuery | BinaryQuery | RangeQuery;

    interface ModelSaveOptions {
        /** Controls whether trying to save item without loading first. */
        ignoreUnloaded?: boolean;
    }

    interface ModelToObjectOptions {
        /** Controls whether omitting computed properties of model or not. */
        omitComputed?: boolean;

        /** Controls whether values in native object are in serializable form or not. */
        serialized?: boolean;
    }

    interface ModelToObjectOptionsExtended extends ModelToObjectOptions {
        /** Provides UUID of resulting instance of Model used in preference over UUID found in data record. */
        uuid?: UuidValue;
    }

    interface IndexFindOptions {
        /** Lower limit of range of values to fetch. Omit for open end. */
        lowerLimit?: any;
        /** Upper limit of range of values to fetch. Omit for open end. */
        upperLimit?: any;
        /** Controls whether listing UUIDs in descending order according to tracked property's values or not. */
        descending?: boolean;
        /** Controls whether returned generator is yielding just UUIDs or UUIDs and tracked value (the key in index) as pair. */
        withKey?: boolean;
        /** Controls whether appending UUIDs of records tracked for having no/null value or not. */
        appendNullItems?: boolean;
    }

    class OdemModelIndexer {
        /** Lists types of test operations this kind of index is suitable for. */
        static get indexTypes(): string[];

        /** Detects if there is an index handler for provided type of test. */
        static has( typeName: string ): boolean;

        /** Fetches class of index handler for provided type of test. */
        static select( typeName: string ): Function;

        /** Creates instance of current indexer. */
        static create( options: ModelIndexDefinition ): OdemModelIndexer;

        /** Drops all records tracked in index. */
        clear(): OdemModelIndexer;

        /** Adds track on record selected by its UUID to index for having value in covered property. */
        add( uuid: Buffer, value: any ): void;

        /** Changes track on record selected by its UUID to index for change of value in covered property. */
        update( uuid: Buffer, oldValue: any, newValue: any, searchExisting?: boolean ): void;

        /** Removes track on record only selected by its UUID from index. */
        remove( uuid: Buffer ): boolean;

        /** Removes track on record selected by its UUID and recently tracked value of covered property from index. */
        removeValue( uuid: Buffer, value: any ): boolean;

        /** Returns generator for UUIDs of records with value in defined range. */
        findBetween( options?: IndexFindOptions ): GeneratorFunction;
    }

    class LifeCycleHooks {
        /**
         * Life cycle hook invoked on creating new instance of current model
         * with information provided in construction for filtering.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-beforecreate
         */
        beforeCreate?( info: BeforeCreateInformation ): BeforeCreateInformation;

        /**
         * Life cycle hook invoked at end of constructing new instance of
         * current model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-aftercreate
         */
        afterCreate?(): void;

        /**
         * Life cycle hook invoked before loading record of current model's
         * item from adopted backend.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-beforeload
         */
        beforeLoad?(): Promise<void> | void;

        /**
         * Life cycle hook invoked right after loading record of current
         * model's item from adopted backend for filtering that record.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-afterload
         */
        afterLoad?( record: object ): object;

        /**
         * Life cycle hook invoked before first validation handler defined in
         * model's schema.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-beforevalidate
         */
        beforeValidate?(): void | Error[] | Promise<Error[]>;

        /**
         * Life cycle hook invoked after last validation handler defined in
         * model's schema providing all collected validation errors for
         * filtering.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-aftervalidate
         */
        afterValidate?( collectedErrors: Error[] ): Error[];

        /**
         * Life cycle hook invoked after successfully validating current
         * properties of item and right before writing record of properties to
         * backend for filtering the latter.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-beforesave
         */
        beforeSave?( existsAlready: boolean, propertiesToSave: object ): object;

        /**
         * Life cycle hook invoked after successfully saving record of
         * properties to adopted backend..
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-aftersave
         */
        afterSave?( existedAlready: boolean ): Promise<void> | void;

        /**
         * Life cycle hook invoked before removing item of current model mostly
         * for handling this case and probably reject it by rejecting returned
         * promise.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-beforeremove
         */
        beforeRemove?(): Promise<void> | void;

        /**
         * Life cycle hook invoked after successfully removing item of current
         * model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-afterremove
         */
        afterRemove?(): Promise<void> | void;
    }

    /**
     * Defines common API of Odem-based models.
     *
     * @see https://hitchyjs.github.io/plugin-odem/api/model.html
     */
    class Model extends LifeCycleHooks implements HitchyModelComponent {
        constructor( itemUuid?: UuidValue, options?: ModelOptions );

        /**
         * Represents particular value representing _default_ so `undefined`
         * and `null` can be represented explicitly.
         */
        get $default(): any;

        /**
         * Exposes defined name of model.
         */
        static get name(): string;

        /**
         * Exposes schema definition of current model.
         */
        static get schema(): ModelSchema;

        /**
         * Lists prepared indices of current model.
         */
        static get indices(): OdemModelIndexer[];

        /**
         * Exposes per-model default value for per-instance `onUnsaved` option.
         */
        static get onUnsaved(): OdemModelOptionOnUnsaveEnum;

        /**
         * Normalizes provided UUID value.
         */
        static normalizeUUID( uuid: UuidValue ): Buffer;

        /**
         * Renders provided UUID as human-readable string.
         */
        static formatUUID( uuid: UuidValue ): string;

        /**
         * Renders backend key selecting record of current model identified by
         * given UUID. Omit UUID for getting template containing `%u` where UUID
         * should be injected on creating new record. */
        static uuidToKey( uuid?: UuidValue ): string;

        /**
         * Extracts UUID from backend key addressing single record.
         *
         */
        static keyToUuid( key: string ): Buffer;

        /**
         * Extracts name of model provided backend key is related to.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-keytoname
         */
        static keyToName( key: string ): string | null;

        /**
         * Promises information if current item exists in backend or not. Items
         * don't exist in backend when created recently without loading or
         * saving.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-exists
         */
        get $exists(): Promise<boolean>;

        /**
         * Starts observing adopted backend for change notifications regarding
         * current model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-observebackend
         */
        static observeBackend(): void;

        /**
         * Loads properties from backend promising current model instance with
         * properties loaded on success.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-load
         */
        load(): Promise<Model>;

        /**
         * Saves properties to backend promising current model instance on
         * success.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-save
         */
        save( options?: ModelSaveOptions ): Promise<Model>;

        /**
         * Removes properties to backend promising current model instance on
         * success.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-save
         */
        remove(): Promise<Model>;

        /**
         * Validates current values of properties to comply with model's
         * constraints defined in its schema.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-validate
         */
        validate(): Promise<Error[]>;

        /**
         * Extracts properties of current item into regular Javascript object.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-save
         */
        toObject( options?: ModelToObjectOptions ): object;

        /**
         * Replaces properties of current instance with values found in provided
         * record.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-fromobject
         */
        fromObject( data: object, options?: ModelToObjectOptions ): Model;

        /**
         * Generates new instance of model from provided data record.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-fromobject
         */
        static fromObject( data: object, options?: ModelToObjectOptionsExtended ): Model;

        /**
         * Fetches index suitable for improved testing type of operation on
         * named property of model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-getindex
         */
        getIndex( property: string, type?: string ): OdemModelIndexer | undefined;

        /**
         * Streams UUIDs of all records in backend on current model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-uuistream
         */
        static uuidStream(): Readable;

        /**
         * Promises items of current model.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-list
         */
        static list( listOptions?: ListOptions, dataOptions?: DataOptions ): Promise<Model[]>;

        /**
         * Promises items of current model with named property's values matching selected test operation.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-findbyattribute
         */
        static findByAttribute( property: string, value: any, operator: string, listOptions?: ListOptions, dataOptions?: DataOptions ): Promise<Model[]>;

        /**
         * Promises items of current model passing described test.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-find
         */
        static find( test: Query, listOptions?: ListOptions, dataOptions?: DataOptions ): Promise<Model[]>;

        /**
         * Promises all indices of current model being prepared.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-indexloaded
         */
        static processTerm( test: Query, sortBy?: string, sortAscendingly?: boolean ): Promise<Model[]>;

        /**
         * Promises all indices of current model being prepared.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-indexloaded
         */
        static get indexLoaded(): Promise<OdemModelIndexer[]>;

        /**
         * Creates new model from provided definition.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-define
         */
        static define( modelName: string, schema: ModelSchemaDefinition, customBaseClass?: Function, adapter?: OdemAdapter );

        /**
         * Refers to current item in scope of parent class.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-super
         */
        get $super(): Model;

        /**
         * Exposes API of running Hitchy instance.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#instance-api
         */
        get $api(): HitchyAPI;

        /**
         * Refers to class of model this one is extending.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-derivesfrom
         */
        static get derivesFrom(): Function;

        /**
         * Provides adapter used with current model for accessing backend.
         *
         * @see https://hitchyjs.github.io/plugin-odem/api/model.html#model-adapter
         */
        static get adapter(): OdemAdapter;
    }
}
