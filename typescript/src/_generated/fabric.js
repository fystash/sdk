/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $Array = $util.global.Array, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $String = $util.global.String, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const fystash = $root.fystash = (() => {

    /**
     * Namespace fystash.
     * @exports fystash
     * @namespace
     */
    const fystash = {};

    fystash.fabric = (function() {

        /**
         * Namespace fabric.
         * @memberof fystash
         * @namespace
         */
        const fabric = {};

        fabric.v1 = (function() {

            /**
             * Namespace v1.
             * @memberof fystash.fabric
             * @namespace
             */
            const v1 = {};

            /**
             * MessageKind enum.
             * @name fystash.fabric.v1.MessageKind
             * @enum {number}
             * @property {number} MESSAGE_KIND_UNSPECIFIED=0 MESSAGE_KIND_UNSPECIFIED value
             * @property {number} MESSAGE_KIND_REQUEST=1 MESSAGE_KIND_REQUEST value
             * @property {number} MESSAGE_KIND_RESPONSE=2 MESSAGE_KIND_RESPONSE value
             * @property {number} MESSAGE_KIND_EVENT=3 MESSAGE_KIND_EVENT value
             * @property {number} MESSAGE_KIND_ACK=4 MESSAGE_KIND_ACK value
             * @property {number} MESSAGE_KIND_CANCEL=5 MESSAGE_KIND_CANCEL value
             * @property {number} MESSAGE_KIND_ERROR=6 MESSAGE_KIND_ERROR value
             */
            v1.MessageKind = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "MESSAGE_KIND_UNSPECIFIED"] = 0;
                values[valuesById[1] = "MESSAGE_KIND_REQUEST"] = 1;
                values[valuesById[2] = "MESSAGE_KIND_RESPONSE"] = 2;
                values[valuesById[3] = "MESSAGE_KIND_EVENT"] = 3;
                values[valuesById[4] = "MESSAGE_KIND_ACK"] = 4;
                values[valuesById[5] = "MESSAGE_KIND_CANCEL"] = 5;
                values[valuesById[6] = "MESSAGE_KIND_ERROR"] = 6;
                return values;
            })();

            v1.Register = (function() {

                /**
                 * Properties of a Register.
                 * @typedef {Object} fystash.fabric.v1.Register.$Properties
                 * @property {number|null} [protocolVersion] Register protocolVersion
                 * @property {string|null} [roomId] Register roomId
                 * @property {string|null} [agentId] Register agentId
                 * @property {Uint8Array|null} [sessionToken] Register sessionToken
                 * @property {Array.<string>|null} [subscriptions] Register subscriptions
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Register.
                 * @memberof fystash.fabric.v1
                 * @interface IRegister
                 * @augments fystash.fabric.v1.Register.$Properties
                 * @deprecated Use fystash.fabric.v1.Register.$Properties instead.
                 */

                /**
                 * Shape of a Register.
                 * @typedef {fystash.fabric.v1.Register.$Properties} fystash.fabric.v1.Register.$Shape
                 */

                /**
                 * Constructs a new Register.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents a Register.
                 * @constructor
                 * @param {fystash.fabric.v1.Register.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Register = function (properties) {
                    this.subscriptions = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Register protocolVersion.
                 * @member {number} protocolVersion
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 */
                Register.prototype.protocolVersion = 0;

                /**
                 * Register roomId.
                 * @member {string} roomId
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 */
                Register.prototype.roomId = "";

                /**
                 * Register agentId.
                 * @member {string} agentId
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 */
                Register.prototype.agentId = "";

                /**
                 * Register sessionToken.
                 * @member {Uint8Array} sessionToken
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 */
                Register.prototype.sessionToken = $util.newBuffer([]);

                /**
                 * Register subscriptions.
                 * @member {Array.<string>} subscriptions
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 */
                Register.prototype.subscriptions = $util.emptyArray;

                /**
                 * Creates a new Register instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {fystash.fabric.v1.Register.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.Register} Register instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.Register.$Shape): fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape;
                 *   (properties?: fystash.fabric.v1.Register.$Properties): fystash.fabric.v1.Register;
                 * }}
                 */
                Register.create = function(properties) {
                    return new Register(properties);
                };

                /**
                 * Encodes the specified Register message. Does not implicitly {@link fystash.fabric.v1.Register.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {fystash.fabric.v1.Register.$Properties} message Register message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Register.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion") && message.protocolVersion !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.protocolVersion);
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId") && message.roomId !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.roomId);
                    if (message.agentId != null && $Object.hasOwnProperty.call(message, "agentId") && message.agentId !== "")
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.agentId);
                    if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken") && message.sessionToken.length)
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.sessionToken);
                    if (message.subscriptions != null && message.subscriptions.length)
                        for (let i = 0; i < message.subscriptions.length; ++i)
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.subscriptions[i]);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Register message, length delimited. Does not implicitly {@link fystash.fabric.v1.Register.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {fystash.fabric.v1.Register.$Properties} message Register message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Register.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a Register message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape} Register
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Register.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.Register(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.protocolVersion = value;
                                else
                                    delete message.protocolVersion;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.roomId = value;
                                else
                                    delete message.roomId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.agentId = value;
                                else
                                    delete message.agentId;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionToken = value;
                                else
                                    delete message.sessionToken;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.subscriptions && message.subscriptions.length))
                                    message.subscriptions = [];
                                message.subscriptions.push(reader.stringVerify());
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a Register message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape} Register
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Register.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Register message.
                 * @function verify
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Register.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        if (!$util.isInteger(message.protocolVersion))
                            return "protocolVersion: integer expected";
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        if (!$util.isString(message.roomId))
                            return "roomId: string expected";
                    if (message.agentId != null && $Object.hasOwnProperty.call(message, "agentId"))
                        if (!$util.isString(message.agentId))
                            return "agentId: string expected";
                    if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken"))
                        if (!(message.sessionToken && typeof message.sessionToken.length === "number" || $util.isString(message.sessionToken)))
                            return "sessionToken: buffer expected";
                    if (message.subscriptions != null && $Object.hasOwnProperty.call(message, "subscriptions")) {
                        if (!$Array.isArray(message.subscriptions))
                            return "subscriptions: array expected";
                        for (let i = 0; i < message.subscriptions.length; ++i)
                            if (!$util.isString(message.subscriptions[i]))
                                return "subscriptions: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a Register message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.Register} Register
                 */
                Register.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.Register)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.Register: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.Register();
                    if (object.protocolVersion != null)
                        if ($Number(object.protocolVersion) !== 0)
                            message.protocolVersion = object.protocolVersion >>> 0;
                    if (object.roomId != null)
                        if (typeof object.roomId !== "string" || object.roomId.length)
                            message.roomId = $String(object.roomId);
                    if (object.agentId != null)
                        if (typeof object.agentId !== "string" || object.agentId.length)
                            message.agentId = $String(object.agentId);
                    if (object.sessionToken != null)
                        if (object.sessionToken.length)
                            if (typeof object.sessionToken === "string")
                                $util.base64.decode(object.sessionToken, message.sessionToken = $util.newBuffer($util.base64.length(object.sessionToken)), 0);
                            else if (object.sessionToken.length >= 0)
                                message.sessionToken = object.sessionToken;
                    if (object.subscriptions) {
                        if (!$Array.isArray(object.subscriptions))
                            throw $TypeError(".fystash.fabric.v1.Register.subscriptions: array expected");
                        message.subscriptions = $Array(object.subscriptions.length);
                        for (let i = 0; i < object.subscriptions.length; ++i)
                            message.subscriptions[i] = $String(object.subscriptions[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Register message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {fystash.fabric.v1.Register} message Register
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Register.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.subscriptions = [];
                    if (options.defaults) {
                        object.protocolVersion = 0;
                        object.roomId = "";
                        object.agentId = "";
                        if (options.bytes === $String)
                            object.sessionToken = "";
                        else {
                            object.sessionToken = [];
                            if (options.bytes !== $Array)
                                object.sessionToken = $util.newBuffer(object.sessionToken);
                        }
                    }
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        object.protocolVersion = message.protocolVersion;
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        object.roomId = message.roomId;
                    if (message.agentId != null && $Object.hasOwnProperty.call(message, "agentId"))
                        object.agentId = message.agentId;
                    if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken"))
                        object.sessionToken = options.bytes === $String ? $util.base64.encode(message.sessionToken, 0, message.sessionToken.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionToken) : message.sessionToken;
                    if (message.subscriptions && message.subscriptions.length) {
                        object.subscriptions = $Array(message.subscriptions.length);
                        for (let j = 0; j < message.subscriptions.length; ++j)
                            object.subscriptions[j] = message.subscriptions[j];
                    }
                    return object;
                };

                /**
                 * Converts this Register to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.Register
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Register.prototype.toJSON = function() {
                    return Register.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Register
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.Register
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Register.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.Register";
                };

                return Register;
            })();

            v1.Envelope = (function() {

                /**
                 * Properties of an Envelope.
                 * @typedef {Object} fystash.fabric.v1.Envelope.$Properties
                 * @property {number|null} [protocolVersion] Envelope protocolVersion
                 * @property {Uint8Array|null} [messageId] Envelope messageId
                 * @property {string|null} [roomId] Envelope roomId
                 * @property {string|null} [source] Envelope source
                 * @property {string|null} [destination] Envelope destination
                 * @property {fystash.fabric.v1.MessageKind|null} [kind] Envelope kind
                 * @property {number|Long|null} [streamId] Envelope streamId
                 * @property {number|Long|null} [sequence] Envelope sequence
                 * @property {number|Long|null} [deadlineUnixMs] Envelope deadlineUnixMs
                 * @property {Object.<string,string>|null} [headers] Envelope headers
                 * @property {Uint8Array|null} [payload] Envelope payload
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an Envelope.
                 * @memberof fystash.fabric.v1
                 * @interface IEnvelope
                 * @augments fystash.fabric.v1.Envelope.$Properties
                 * @deprecated Use fystash.fabric.v1.Envelope.$Properties instead.
                 */

                /**
                 * Shape of an Envelope.
                 * @typedef {fystash.fabric.v1.Envelope.$Properties} fystash.fabric.v1.Envelope.$Shape
                 */

                /**
                 * Constructs a new Envelope.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents an Envelope.
                 * @constructor
                 * @param {fystash.fabric.v1.Envelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Envelope = function (properties) {
                    this.headers = {};
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Envelope protocolVersion.
                 * @member {number} protocolVersion
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.protocolVersion = 0;

                /**
                 * Envelope messageId.
                 * @member {Uint8Array} messageId
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.messageId = $util.newBuffer([]);

                /**
                 * Envelope roomId.
                 * @member {string} roomId
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.roomId = "";

                /**
                 * Envelope source.
                 * @member {string} source
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.source = "";

                /**
                 * Envelope destination.
                 * @member {string} destination
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.destination = "";

                /**
                 * Envelope kind.
                 * @member {fystash.fabric.v1.MessageKind} kind
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.kind = 0;

                /**
                 * Envelope streamId.
                 * @member {number|Long} streamId
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.streamId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Envelope sequence.
                 * @member {number|Long} sequence
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.sequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Envelope deadlineUnixMs.
                 * @member {number|Long} deadlineUnixMs
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.deadlineUnixMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Envelope headers.
                 * @member {Object.<string,string>} headers
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.headers = $util.emptyObject;

                /**
                 * Envelope payload.
                 * @member {Uint8Array} payload
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.payload = $util.newBuffer([]);

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {fystash.fabric.v1.Envelope.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.Envelope} Envelope instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.Envelope.$Shape): fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape;
                 *   (properties?: fystash.fabric.v1.Envelope.$Properties): fystash.fabric.v1.Envelope;
                 * }}
                 */
                Envelope.create = function(properties) {
                    return new Envelope(properties);
                };

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link fystash.fabric.v1.Envelope.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {fystash.fabric.v1.Envelope.$Properties} message Envelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Envelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion") && message.protocolVersion !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.protocolVersion);
                    if (message.messageId != null && $Object.hasOwnProperty.call(message, "messageId") && message.messageId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.messageId);
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId") && message.roomId !== "")
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.roomId);
                    if (message.source != null && $Object.hasOwnProperty.call(message, "source") && message.source !== "")
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.source);
                    if (message.destination != null && $Object.hasOwnProperty.call(message, "destination") && message.destination !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.destination);
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind") && message.kind !== 0)
                        writer.uint32(/* id 6, wireType 0 =*/48).int32(message.kind);
                    if (message.streamId != null && $Object.hasOwnProperty.call(message, "streamId") && (typeof message.streamId === "object" ? message.streamId.low || message.streamId.high : message.streamId !== 0))
                        writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.streamId);
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence") && (typeof message.sequence === "object" ? message.sequence.low || message.sequence.high : message.sequence !== 0))
                        writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.sequence);
                    if (message.deadlineUnixMs != null && $Object.hasOwnProperty.call(message, "deadlineUnixMs") && (typeof message.deadlineUnixMs === "object" ? message.deadlineUnixMs.low || message.deadlineUnixMs.high : message.deadlineUnixMs !== 0))
                        writer.uint32(/* id 9, wireType 0 =*/72).int64(message.deadlineUnixMs);
                    if (message.headers != null && $Object.hasOwnProperty.call(message, "headers"))
                        for (let keys = $Object.keys(message.headers), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 10, wireType 2 =*/82).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.headers[keys[i]]).ldelim();
                    if (message.payload != null && $Object.hasOwnProperty.call(message, "payload") && message.payload.length)
                        writer.uint32(/* id 11, wireType 2 =*/90).bytes(message.payload);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Envelope message, length delimited. Does not implicitly {@link fystash.fabric.v1.Envelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {fystash.fabric.v1.Envelope.$Properties} message Envelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Envelope.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Envelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.Envelope(), key, value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.protocolVersion = value;
                                else
                                    delete message.protocolVersion;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.messageId = value;
                                else
                                    delete message.messageId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.roomId = value;
                                else
                                    delete message.roomId;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.source = value;
                                else
                                    delete message.source;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.destination = value;
                                else
                                    delete message.destination;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.kind = value;
                                else
                                    delete message.kind;
                                continue;
                            }
                        case 7: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.streamId = value;
                                else
                                    delete message.streamId;
                                continue;
                            }
                        case 8: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.sequence = value;
                                else
                                    delete message.sequence;
                                continue;
                            }
                        case 9: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                    message.deadlineUnixMs = value;
                                else
                                    delete message.deadlineUnixMs;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                if (message.headers === $util.emptyObject)
                                    message.headers = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.tag();
                                    wireType = tag2 & 7;
                                    switch (tag2 >>>= 3) {
                                    case 1:
                                        if (wireType !== 2)
                                            break;
                                        key = reader.stringVerify();
                                        continue;
                                    case 2:
                                        if (wireType !== 2)
                                            break;
                                        value = reader.stringVerify();
                                        continue;
                                    }
                                    reader.skipType(wireType, _depth, tag2);
                                }
                                if (key === "__proto__")
                                    $util.makeProp(message.headers, key);
                                message.headers[key] = value;
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.payload = value;
                                else
                                    delete message.payload;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an Envelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Envelope.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Envelope message.
                 * @function verify
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Envelope.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        if (!$util.isInteger(message.protocolVersion))
                            return "protocolVersion: integer expected";
                    if (message.messageId != null && $Object.hasOwnProperty.call(message, "messageId"))
                        if (!(message.messageId && typeof message.messageId.length === "number" || $util.isString(message.messageId)))
                            return "messageId: buffer expected";
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        if (!$util.isString(message.roomId))
                            return "roomId: string expected";
                    if (message.source != null && $Object.hasOwnProperty.call(message, "source"))
                        if (!$util.isString(message.source))
                            return "source: string expected";
                    if (message.destination != null && $Object.hasOwnProperty.call(message, "destination"))
                        if (!$util.isString(message.destination))
                            return "destination: string expected";
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind"))
                        if (typeof message.kind !== "number" || (message.kind | 0) !== message.kind)
                            return "kind: enum value expected";
                    if (message.streamId != null && $Object.hasOwnProperty.call(message, "streamId"))
                        if (!$util.isInteger(message.streamId) && !(message.streamId && $util.isInteger(message.streamId.low) && $util.isInteger(message.streamId.high)))
                            return "streamId: integer|Long expected";
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence"))
                        if (!$util.isInteger(message.sequence) && !(message.sequence && $util.isInteger(message.sequence.low) && $util.isInteger(message.sequence.high)))
                            return "sequence: integer|Long expected";
                    if (message.deadlineUnixMs != null && $Object.hasOwnProperty.call(message, "deadlineUnixMs"))
                        if (!$util.isInteger(message.deadlineUnixMs) && !(message.deadlineUnixMs && $util.isInteger(message.deadlineUnixMs.low) && $util.isInteger(message.deadlineUnixMs.high)))
                            return "deadlineUnixMs: integer|Long expected";
                    if (message.headers != null && $Object.hasOwnProperty.call(message, "headers")) {
                        if (!$util.isObject(message.headers))
                            return "headers: object expected";
                        let key = $Object.keys(message.headers);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.headers[key[i]]))
                                return "headers: string{k:string} expected";
                    }
                    if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                        if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                            return "payload: buffer expected";
                    return null;
                };

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.Envelope} Envelope
                 */
                Envelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.Envelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.Envelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.Envelope();
                    if (object.protocolVersion != null)
                        if ($Number(object.protocolVersion) !== 0)
                            message.protocolVersion = object.protocolVersion >>> 0;
                    if (object.messageId != null)
                        if (object.messageId.length)
                            if (typeof object.messageId === "string")
                                $util.base64.decode(object.messageId, message.messageId = $util.newBuffer($util.base64.length(object.messageId)), 0);
                            else if (object.messageId.length >= 0)
                                message.messageId = object.messageId;
                    if (object.roomId != null)
                        if (typeof object.roomId !== "string" || object.roomId.length)
                            message.roomId = $String(object.roomId);
                    if (object.source != null)
                        if (typeof object.source !== "string" || object.source.length)
                            message.source = $String(object.source);
                    if (object.destination != null)
                        if (typeof object.destination !== "string" || object.destination.length)
                            message.destination = $String(object.destination);
                    if (object.kind !== 0 && (typeof object.kind !== "string" || $root.fystash.fabric.v1.MessageKind[object.kind] !== 0))
                        switch (object.kind) {
                        case "MESSAGE_KIND_UNSPECIFIED":
                        case 0:
                            message.kind = 0;
                            break;
                        case "MESSAGE_KIND_REQUEST":
                        case 1:
                            message.kind = 1;
                            break;
                        case "MESSAGE_KIND_RESPONSE":
                        case 2:
                            message.kind = 2;
                            break;
                        case "MESSAGE_KIND_EVENT":
                        case 3:
                            message.kind = 3;
                            break;
                        case "MESSAGE_KIND_ACK":
                        case 4:
                            message.kind = 4;
                            break;
                        case "MESSAGE_KIND_CANCEL":
                        case 5:
                            message.kind = 5;
                            break;
                        case "MESSAGE_KIND_ERROR":
                        case 6:
                            message.kind = 6;
                            break;
                        default:
                            if (typeof object.kind === "number" && (object.kind | 0) === object.kind)
                                message.kind = object.kind;
                        }
                    if (object.streamId != null)
                        if (typeof object.streamId === "object" ? object.streamId.low || object.streamId.high : $Number(object.streamId) !== 0)
                            if ($util.Long)
                                message.streamId = $util.Long.fromValue(object.streamId, true);
                            else if (typeof object.streamId === "string")
                                message.streamId = $parseInt(object.streamId, 10);
                            else if (typeof object.streamId === "number")
                                message.streamId = object.streamId;
                            else if (typeof object.streamId === "object")
                                message.streamId = new $util.LongBits(object.streamId.low >>> 0, object.streamId.high >>> 0).toNumber(true);
                    if (object.sequence != null)
                        if (typeof object.sequence === "object" ? object.sequence.low || object.sequence.high : $Number(object.sequence) !== 0)
                            if ($util.Long)
                                message.sequence = $util.Long.fromValue(object.sequence, true);
                            else if (typeof object.sequence === "string")
                                message.sequence = $parseInt(object.sequence, 10);
                            else if (typeof object.sequence === "number")
                                message.sequence = object.sequence;
                            else if (typeof object.sequence === "object")
                                message.sequence = new $util.LongBits(object.sequence.low >>> 0, object.sequence.high >>> 0).toNumber(true);
                    if (object.deadlineUnixMs != null)
                        if (typeof object.deadlineUnixMs === "object" ? object.deadlineUnixMs.low || object.deadlineUnixMs.high : $Number(object.deadlineUnixMs) !== 0)
                            if ($util.Long)
                                message.deadlineUnixMs = $util.Long.fromValue(object.deadlineUnixMs, false);
                            else if (typeof object.deadlineUnixMs === "string")
                                message.deadlineUnixMs = $parseInt(object.deadlineUnixMs, 10);
                            else if (typeof object.deadlineUnixMs === "number")
                                message.deadlineUnixMs = object.deadlineUnixMs;
                            else if (typeof object.deadlineUnixMs === "object")
                                message.deadlineUnixMs = new $util.LongBits(object.deadlineUnixMs.low >>> 0, object.deadlineUnixMs.high >>> 0).toNumber();
                    if (object.headers) {
                        if (!$util.isObject(object.headers))
                            throw $TypeError(".fystash.fabric.v1.Envelope.headers: object expected");
                        message.headers = {};
                        for (let keys = $Object.keys(object.headers), i = 0; i < keys.length; ++i) {
                            if (keys[i] === "__proto__")
                                $util.makeProp(message.headers, keys[i]);
                            message.headers[keys[i]] = $String(object.headers[keys[i]]);
                        }
                    }
                    if (object.payload != null)
                        if (object.payload.length)
                            if (typeof object.payload === "string")
                                $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                            else if (object.payload.length >= 0)
                                message.payload = object.payload;
                    return message;
                };

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {fystash.fabric.v1.Envelope} message Envelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Envelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.objects || options.defaults)
                        object.headers = {};
                    if (options.defaults) {
                        object.protocolVersion = 0;
                        if (options.bytes === $String)
                            object.messageId = "";
                        else {
                            object.messageId = [];
                            if (options.bytes !== $Array)
                                object.messageId = $util.newBuffer(object.messageId);
                        }
                        object.roomId = "";
                        object.source = "";
                        object.destination = "";
                        object.kind = options.enums === $String ? "MESSAGE_KIND_UNSPECIFIED" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.streamId = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.streamId = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.sequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.sequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.deadlineUnixMs = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.deadlineUnixMs = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if (options.bytes === $String)
                            object.payload = "";
                        else {
                            object.payload = [];
                            if (options.bytes !== $Array)
                                object.payload = $util.newBuffer(object.payload);
                        }
                    }
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        object.protocolVersion = message.protocolVersion;
                    if (message.messageId != null && $Object.hasOwnProperty.call(message, "messageId"))
                        object.messageId = options.bytes === $String ? $util.base64.encode(message.messageId, 0, message.messageId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.messageId) : message.messageId;
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        object.roomId = message.roomId;
                    if (message.source != null && $Object.hasOwnProperty.call(message, "source"))
                        object.source = message.source;
                    if (message.destination != null && $Object.hasOwnProperty.call(message, "destination"))
                        object.destination = message.destination;
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind"))
                        object.kind = options.enums === $String ? $root.fystash.fabric.v1.MessageKind[message.kind] === $undefined ? message.kind : $root.fystash.fabric.v1.MessageKind[message.kind] : message.kind;
                    if (message.streamId != null && $Object.hasOwnProperty.call(message, "streamId"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.streamId = typeof message.streamId === "number" ? $BigInt(message.streamId) : $util.Long.fromBits(message.streamId.low >>> 0, message.streamId.high >>> 0, true).toBigInt();
                        else if (typeof message.streamId === "number")
                            object.streamId = options.longs === $String ? $String(message.streamId) : message.streamId;
                        else
                            object.streamId = options.longs === $String ? $util.Long.prototype.toString.call(message.streamId) : options.longs === $Number ? new $util.LongBits(message.streamId.low >>> 0, message.streamId.high >>> 0).toNumber(true) : message.streamId;
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.sequence = typeof message.sequence === "number" ? $BigInt(message.sequence) : $util.Long.fromBits(message.sequence.low >>> 0, message.sequence.high >>> 0, true).toBigInt();
                        else if (typeof message.sequence === "number")
                            object.sequence = options.longs === $String ? $String(message.sequence) : message.sequence;
                        else
                            object.sequence = options.longs === $String ? $util.Long.prototype.toString.call(message.sequence) : options.longs === $Number ? new $util.LongBits(message.sequence.low >>> 0, message.sequence.high >>> 0).toNumber(true) : message.sequence;
                    if (message.deadlineUnixMs != null && $Object.hasOwnProperty.call(message, "deadlineUnixMs"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.deadlineUnixMs = typeof message.deadlineUnixMs === "number" ? $BigInt(message.deadlineUnixMs) : $util.Long.fromBits(message.deadlineUnixMs.low >>> 0, message.deadlineUnixMs.high >>> 0, false).toBigInt();
                        else if (typeof message.deadlineUnixMs === "number")
                            object.deadlineUnixMs = options.longs === $String ? $String(message.deadlineUnixMs) : message.deadlineUnixMs;
                        else
                            object.deadlineUnixMs = options.longs === $String ? $util.Long.prototype.toString.call(message.deadlineUnixMs) : options.longs === $Number ? new $util.LongBits(message.deadlineUnixMs.low >>> 0, message.deadlineUnixMs.high >>> 0).toNumber() : message.deadlineUnixMs;
                    let keys2;
                    if (message.headers && (keys2 = $Object.keys(message.headers)).length) {
                        object.headers = {};
                        for (let j = 0; j < keys2.length; ++j) {
                            if (keys2[j] === "__proto__")
                                $util.makeProp(object.headers, keys2[j]);
                            object.headers[keys2[j]] = message.headers[keys2[j]];
                        }
                    }
                    if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                        object.payload = options.bytes === $String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.payload) : message.payload;
                    return object;
                };

                /**
                 * Converts this Envelope to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.Envelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Envelope.prototype.toJSON = function() {
                    return Envelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Envelope
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.Envelope
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Envelope.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.Envelope";
                };

                return Envelope;
            })();

            v1.BarrierArrive = (function() {

                /**
                 * Properties of a BarrierArrive.
                 * @typedef {Object} fystash.fabric.v1.BarrierArrive.$Properties
                 * @property {string|null} [roomId] BarrierArrive roomId
                 * @property {string|null} [barrierId] BarrierArrive barrierId
                 * @property {number|null} [parties] BarrierArrive parties
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a BarrierArrive.
                 * @memberof fystash.fabric.v1
                 * @interface IBarrierArrive
                 * @augments fystash.fabric.v1.BarrierArrive.$Properties
                 * @deprecated Use fystash.fabric.v1.BarrierArrive.$Properties instead.
                 */

                /**
                 * Shape of a BarrierArrive.
                 * @typedef {fystash.fabric.v1.BarrierArrive.$Properties} fystash.fabric.v1.BarrierArrive.$Shape
                 */

                /**
                 * Constructs a new BarrierArrive.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents a BarrierArrive.
                 * @constructor
                 * @param {fystash.fabric.v1.BarrierArrive.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const BarrierArrive = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * BarrierArrive roomId.
                 * @member {string} roomId
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @instance
                 */
                BarrierArrive.prototype.roomId = "";

                /**
                 * BarrierArrive barrierId.
                 * @member {string} barrierId
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @instance
                 */
                BarrierArrive.prototype.barrierId = "";

                /**
                 * BarrierArrive parties.
                 * @member {number} parties
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @instance
                 */
                BarrierArrive.prototype.parties = 0;

                /**
                 * Creates a new BarrierArrive instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {fystash.fabric.v1.BarrierArrive.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.BarrierArrive} BarrierArrive instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.BarrierArrive.$Shape): fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape;
                 *   (properties?: fystash.fabric.v1.BarrierArrive.$Properties): fystash.fabric.v1.BarrierArrive;
                 * }}
                 */
                BarrierArrive.create = function(properties) {
                    return new BarrierArrive(properties);
                };

                /**
                 * Encodes the specified BarrierArrive message. Does not implicitly {@link fystash.fabric.v1.BarrierArrive.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {fystash.fabric.v1.BarrierArrive.$Properties} message BarrierArrive message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BarrierArrive.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId") && message.roomId !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.roomId);
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId") && message.barrierId !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.barrierId);
                    if (message.parties != null && $Object.hasOwnProperty.call(message, "parties") && message.parties !== 0)
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.parties);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified BarrierArrive message, length delimited. Does not implicitly {@link fystash.fabric.v1.BarrierArrive.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {fystash.fabric.v1.BarrierArrive.$Properties} message BarrierArrive message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BarrierArrive.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a BarrierArrive message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape} BarrierArrive
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BarrierArrive.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.BarrierArrive(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.roomId = value;
                                else
                                    delete message.roomId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.barrierId = value;
                                else
                                    delete message.barrierId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.parties = value;
                                else
                                    delete message.parties;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a BarrierArrive message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape} BarrierArrive
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BarrierArrive.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a BarrierArrive message.
                 * @function verify
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                BarrierArrive.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        if (!$util.isString(message.roomId))
                            return "roomId: string expected";
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId"))
                        if (!$util.isString(message.barrierId))
                            return "barrierId: string expected";
                    if (message.parties != null && $Object.hasOwnProperty.call(message, "parties"))
                        if (!$util.isInteger(message.parties))
                            return "parties: integer expected";
                    return null;
                };

                /**
                 * Creates a BarrierArrive message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.BarrierArrive} BarrierArrive
                 */
                BarrierArrive.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.BarrierArrive)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.BarrierArrive: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.BarrierArrive();
                    if (object.roomId != null)
                        if (typeof object.roomId !== "string" || object.roomId.length)
                            message.roomId = $String(object.roomId);
                    if (object.barrierId != null)
                        if (typeof object.barrierId !== "string" || object.barrierId.length)
                            message.barrierId = $String(object.barrierId);
                    if (object.parties != null)
                        if ($Number(object.parties) !== 0)
                            message.parties = object.parties >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a BarrierArrive message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {fystash.fabric.v1.BarrierArrive} message BarrierArrive
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                BarrierArrive.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.roomId = "";
                        object.barrierId = "";
                        object.parties = 0;
                    }
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        object.roomId = message.roomId;
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId"))
                        object.barrierId = message.barrierId;
                    if (message.parties != null && $Object.hasOwnProperty.call(message, "parties"))
                        object.parties = message.parties;
                    return object;
                };

                /**
                 * Converts this BarrierArrive to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                BarrierArrive.prototype.toJSON = function() {
                    return BarrierArrive.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for BarrierArrive
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.BarrierArrive
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                BarrierArrive.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.BarrierArrive";
                };

                return BarrierArrive;
            })();

            v1.BarrierRelease = (function() {

                /**
                 * Properties of a BarrierRelease.
                 * @typedef {Object} fystash.fabric.v1.BarrierRelease.$Properties
                 * @property {string|null} [roomId] BarrierRelease roomId
                 * @property {string|null} [barrierId] BarrierRelease barrierId
                 * @property {Array.<string>|null} [participants] BarrierRelease participants
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a BarrierRelease.
                 * @memberof fystash.fabric.v1
                 * @interface IBarrierRelease
                 * @augments fystash.fabric.v1.BarrierRelease.$Properties
                 * @deprecated Use fystash.fabric.v1.BarrierRelease.$Properties instead.
                 */

                /**
                 * Shape of a BarrierRelease.
                 * @typedef {fystash.fabric.v1.BarrierRelease.$Properties} fystash.fabric.v1.BarrierRelease.$Shape
                 */

                /**
                 * Constructs a new BarrierRelease.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents a BarrierRelease.
                 * @constructor
                 * @param {fystash.fabric.v1.BarrierRelease.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const BarrierRelease = function (properties) {
                    this.participants = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * BarrierRelease roomId.
                 * @member {string} roomId
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @instance
                 */
                BarrierRelease.prototype.roomId = "";

                /**
                 * BarrierRelease barrierId.
                 * @member {string} barrierId
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @instance
                 */
                BarrierRelease.prototype.barrierId = "";

                /**
                 * BarrierRelease participants.
                 * @member {Array.<string>} participants
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @instance
                 */
                BarrierRelease.prototype.participants = $util.emptyArray;

                /**
                 * Creates a new BarrierRelease instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {fystash.fabric.v1.BarrierRelease.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.BarrierRelease} BarrierRelease instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.BarrierRelease.$Shape): fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape;
                 *   (properties?: fystash.fabric.v1.BarrierRelease.$Properties): fystash.fabric.v1.BarrierRelease;
                 * }}
                 */
                BarrierRelease.create = function(properties) {
                    return new BarrierRelease(properties);
                };

                /**
                 * Encodes the specified BarrierRelease message. Does not implicitly {@link fystash.fabric.v1.BarrierRelease.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {fystash.fabric.v1.BarrierRelease.$Properties} message BarrierRelease message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BarrierRelease.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId") && message.roomId !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.roomId);
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId") && message.barrierId !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.barrierId);
                    if (message.participants != null && message.participants.length)
                        for (let i = 0; i < message.participants.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.participants[i]);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified BarrierRelease message, length delimited. Does not implicitly {@link fystash.fabric.v1.BarrierRelease.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {fystash.fabric.v1.BarrierRelease.$Properties} message BarrierRelease message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BarrierRelease.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a BarrierRelease message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape} BarrierRelease
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BarrierRelease.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.BarrierRelease(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.roomId = value;
                                else
                                    delete message.roomId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.barrierId = value;
                                else
                                    delete message.barrierId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.participants && message.participants.length))
                                    message.participants = [];
                                message.participants.push(reader.stringVerify());
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a BarrierRelease message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape} BarrierRelease
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BarrierRelease.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a BarrierRelease message.
                 * @function verify
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                BarrierRelease.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        if (!$util.isString(message.roomId))
                            return "roomId: string expected";
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId"))
                        if (!$util.isString(message.barrierId))
                            return "barrierId: string expected";
                    if (message.participants != null && $Object.hasOwnProperty.call(message, "participants")) {
                        if (!$Array.isArray(message.participants))
                            return "participants: array expected";
                        for (let i = 0; i < message.participants.length; ++i)
                            if (!$util.isString(message.participants[i]))
                                return "participants: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a BarrierRelease message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.BarrierRelease} BarrierRelease
                 */
                BarrierRelease.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.BarrierRelease)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.BarrierRelease: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.BarrierRelease();
                    if (object.roomId != null)
                        if (typeof object.roomId !== "string" || object.roomId.length)
                            message.roomId = $String(object.roomId);
                    if (object.barrierId != null)
                        if (typeof object.barrierId !== "string" || object.barrierId.length)
                            message.barrierId = $String(object.barrierId);
                    if (object.participants) {
                        if (!$Array.isArray(object.participants))
                            throw $TypeError(".fystash.fabric.v1.BarrierRelease.participants: array expected");
                        message.participants = $Array(object.participants.length);
                        for (let i = 0; i < object.participants.length; ++i)
                            message.participants[i] = $String(object.participants[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a BarrierRelease message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {fystash.fabric.v1.BarrierRelease} message BarrierRelease
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                BarrierRelease.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.participants = [];
                    if (options.defaults) {
                        object.roomId = "";
                        object.barrierId = "";
                    }
                    if (message.roomId != null && $Object.hasOwnProperty.call(message, "roomId"))
                        object.roomId = message.roomId;
                    if (message.barrierId != null && $Object.hasOwnProperty.call(message, "barrierId"))
                        object.barrierId = message.barrierId;
                    if (message.participants && message.participants.length) {
                        object.participants = $Array(message.participants.length);
                        for (let j = 0; j < message.participants.length; ++j)
                            object.participants[j] = message.participants[j];
                    }
                    return object;
                };

                /**
                 * Converts this BarrierRelease to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                BarrierRelease.prototype.toJSON = function() {
                    return BarrierRelease.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for BarrierRelease
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.BarrierRelease
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                BarrierRelease.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.BarrierRelease";
                };

                return BarrierRelease;
            })();

            v1.ArtifactRef = (function() {

                /**
                 * Properties of an ArtifactRef.
                 * @typedef {Object} fystash.fabric.v1.ArtifactRef.$Properties
                 * @property {string|null} [artifactId] ArtifactRef artifactId
                 * @property {string|null} [path] ArtifactRef path
                 * @property {Uint8Array|null} [sha256] ArtifactRef sha256
                 * @property {number|Long|null} [size] ArtifactRef size
                 * @property {string|null} [mediaType] ArtifactRef mediaType
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ArtifactRef.
                 * @memberof fystash.fabric.v1
                 * @interface IArtifactRef
                 * @augments fystash.fabric.v1.ArtifactRef.$Properties
                 * @deprecated Use fystash.fabric.v1.ArtifactRef.$Properties instead.
                 */

                /**
                 * Shape of an ArtifactRef.
                 * @typedef {fystash.fabric.v1.ArtifactRef.$Properties} fystash.fabric.v1.ArtifactRef.$Shape
                 */

                /**
                 * Constructs a new ArtifactRef.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents an ArtifactRef.
                 * @constructor
                 * @param {fystash.fabric.v1.ArtifactRef.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ArtifactRef = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ArtifactRef artifactId.
                 * @member {string} artifactId
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 */
                ArtifactRef.prototype.artifactId = "";

                /**
                 * ArtifactRef path.
                 * @member {string} path
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 */
                ArtifactRef.prototype.path = "";

                /**
                 * ArtifactRef sha256.
                 * @member {Uint8Array} sha256
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 */
                ArtifactRef.prototype.sha256 = $util.newBuffer([]);

                /**
                 * ArtifactRef size.
                 * @member {number|Long} size
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 */
                ArtifactRef.prototype.size = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * ArtifactRef mediaType.
                 * @member {string} mediaType
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 */
                ArtifactRef.prototype.mediaType = "";

                /**
                 * Creates a new ArtifactRef instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {fystash.fabric.v1.ArtifactRef.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.ArtifactRef} ArtifactRef instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.ArtifactRef.$Shape): fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape;
                 *   (properties?: fystash.fabric.v1.ArtifactRef.$Properties): fystash.fabric.v1.ArtifactRef;
                 * }}
                 */
                ArtifactRef.create = function(properties) {
                    return new ArtifactRef(properties);
                };

                /**
                 * Encodes the specified ArtifactRef message. Does not implicitly {@link fystash.fabric.v1.ArtifactRef.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {fystash.fabric.v1.ArtifactRef.$Properties} message ArtifactRef message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ArtifactRef.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.artifactId != null && $Object.hasOwnProperty.call(message, "artifactId") && message.artifactId !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.artifactId);
                    if (message.path != null && $Object.hasOwnProperty.call(message, "path") && message.path !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
                    if (message.sha256 != null && $Object.hasOwnProperty.call(message, "sha256") && message.sha256.length)
                        writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.sha256);
                    if (message.size != null && $Object.hasOwnProperty.call(message, "size") && (typeof message.size === "object" ? message.size.low || message.size.high : message.size !== 0))
                        writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.size);
                    if (message.mediaType != null && $Object.hasOwnProperty.call(message, "mediaType") && message.mediaType !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.mediaType);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ArtifactRef message, length delimited. Does not implicitly {@link fystash.fabric.v1.ArtifactRef.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {fystash.fabric.v1.ArtifactRef.$Properties} message ArtifactRef message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ArtifactRef.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ArtifactRef message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape} ArtifactRef
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ArtifactRef.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.ArtifactRef(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.artifactId = value;
                                else
                                    delete message.artifactId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.path = value;
                                else
                                    delete message.path;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sha256 = value;
                                else
                                    delete message.sha256;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.size = value;
                                else
                                    delete message.size;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.mediaType = value;
                                else
                                    delete message.mediaType;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ArtifactRef message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape} ArtifactRef
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ArtifactRef.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an ArtifactRef message.
                 * @function verify
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ArtifactRef.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.artifactId != null && $Object.hasOwnProperty.call(message, "artifactId"))
                        if (!$util.isString(message.artifactId))
                            return "artifactId: string expected";
                    if (message.path != null && $Object.hasOwnProperty.call(message, "path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.sha256 != null && $Object.hasOwnProperty.call(message, "sha256"))
                        if (!(message.sha256 && typeof message.sha256.length === "number" || $util.isString(message.sha256)))
                            return "sha256: buffer expected";
                    if (message.size != null && $Object.hasOwnProperty.call(message, "size"))
                        if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                            return "size: integer|Long expected";
                    if (message.mediaType != null && $Object.hasOwnProperty.call(message, "mediaType"))
                        if (!$util.isString(message.mediaType))
                            return "mediaType: string expected";
                    return null;
                };

                /**
                 * Creates an ArtifactRef message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.ArtifactRef} ArtifactRef
                 */
                ArtifactRef.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.ArtifactRef)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.ArtifactRef: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.ArtifactRef();
                    if (object.artifactId != null)
                        if (typeof object.artifactId !== "string" || object.artifactId.length)
                            message.artifactId = $String(object.artifactId);
                    if (object.path != null)
                        if (typeof object.path !== "string" || object.path.length)
                            message.path = $String(object.path);
                    if (object.sha256 != null)
                        if (object.sha256.length)
                            if (typeof object.sha256 === "string")
                                $util.base64.decode(object.sha256, message.sha256 = $util.newBuffer($util.base64.length(object.sha256)), 0);
                            else if (object.sha256.length >= 0)
                                message.sha256 = object.sha256;
                    if (object.size != null)
                        if (typeof object.size === "object" ? object.size.low || object.size.high : $Number(object.size) !== 0)
                            if ($util.Long)
                                message.size = $util.Long.fromValue(object.size, true);
                            else if (typeof object.size === "string")
                                message.size = $parseInt(object.size, 10);
                            else if (typeof object.size === "number")
                                message.size = object.size;
                            else if (typeof object.size === "object")
                                message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber(true);
                    if (object.mediaType != null)
                        if (typeof object.mediaType !== "string" || object.mediaType.length)
                            message.mediaType = $String(object.mediaType);
                    return message;
                };

                /**
                 * Creates a plain object from an ArtifactRef message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {fystash.fabric.v1.ArtifactRef} message ArtifactRef
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ArtifactRef.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.artifactId = "";
                        object.path = "";
                        if (options.bytes === $String)
                            object.sha256 = "";
                        else {
                            object.sha256 = [];
                            if (options.bytes !== $Array)
                                object.sha256 = $util.newBuffer(object.sha256);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.size = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.size = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.mediaType = "";
                    }
                    if (message.artifactId != null && $Object.hasOwnProperty.call(message, "artifactId"))
                        object.artifactId = message.artifactId;
                    if (message.path != null && $Object.hasOwnProperty.call(message, "path"))
                        object.path = message.path;
                    if (message.sha256 != null && $Object.hasOwnProperty.call(message, "sha256"))
                        object.sha256 = options.bytes === $String ? $util.base64.encode(message.sha256, 0, message.sha256.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sha256) : message.sha256;
                    if (message.size != null && $Object.hasOwnProperty.call(message, "size"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.size = typeof message.size === "number" ? $BigInt(message.size) : $util.Long.fromBits(message.size.low >>> 0, message.size.high >>> 0, true).toBigInt();
                        else if (typeof message.size === "number")
                            object.size = options.longs === $String ? $String(message.size) : message.size;
                        else
                            object.size = options.longs === $String ? $util.Long.prototype.toString.call(message.size) : options.longs === $Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber(true) : message.size;
                    if (message.mediaType != null && $Object.hasOwnProperty.call(message, "mediaType"))
                        object.mediaType = message.mediaType;
                    return object;
                };

                /**
                 * Converts this ArtifactRef to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ArtifactRef.prototype.toJSON = function() {
                    return ArtifactRef.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ArtifactRef
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.ArtifactRef
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ArtifactRef.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.ArtifactRef";
                };

                return ArtifactRef;
            })();

            v1.ErrorFrame = (function() {

                /**
                 * Properties of an ErrorFrame.
                 * @typedef {Object} fystash.fabric.v1.ErrorFrame.$Properties
                 * @property {string|null} [code] ErrorFrame code
                 * @property {string|null} [message] ErrorFrame message
                 * @property {Uint8Array|null} [relatedMessageId] ErrorFrame relatedMessageId
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ErrorFrame.
                 * @memberof fystash.fabric.v1
                 * @interface IErrorFrame
                 * @augments fystash.fabric.v1.ErrorFrame.$Properties
                 * @deprecated Use fystash.fabric.v1.ErrorFrame.$Properties instead.
                 */

                /**
                 * Shape of an ErrorFrame.
                 * @typedef {fystash.fabric.v1.ErrorFrame.$Properties} fystash.fabric.v1.ErrorFrame.$Shape
                 */

                /**
                 * Constructs a new ErrorFrame.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents an ErrorFrame.
                 * @constructor
                 * @param {fystash.fabric.v1.ErrorFrame.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ErrorFrame = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ErrorFrame code.
                 * @member {string} code
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @instance
                 */
                ErrorFrame.prototype.code = "";

                /**
                 * ErrorFrame message.
                 * @member {string} message
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @instance
                 */
                ErrorFrame.prototype.message = "";

                /**
                 * ErrorFrame relatedMessageId.
                 * @member {Uint8Array} relatedMessageId
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @instance
                 */
                ErrorFrame.prototype.relatedMessageId = $util.newBuffer([]);

                /**
                 * Creates a new ErrorFrame instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {fystash.fabric.v1.ErrorFrame.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.ErrorFrame} ErrorFrame instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.ErrorFrame.$Shape): fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape;
                 *   (properties?: fystash.fabric.v1.ErrorFrame.$Properties): fystash.fabric.v1.ErrorFrame;
                 * }}
                 */
                ErrorFrame.create = function(properties) {
                    return new ErrorFrame(properties);
                };

                /**
                 * Encodes the specified ErrorFrame message. Does not implicitly {@link fystash.fabric.v1.ErrorFrame.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {fystash.fabric.v1.ErrorFrame.$Properties} message ErrorFrame message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ErrorFrame.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.code != null && $Object.hasOwnProperty.call(message, "code") && message.code !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.code);
                    if (message.message != null && $Object.hasOwnProperty.call(message, "message") && message.message !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                    if (message.relatedMessageId != null && $Object.hasOwnProperty.call(message, "relatedMessageId") && message.relatedMessageId.length)
                        writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.relatedMessageId);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ErrorFrame message, length delimited. Does not implicitly {@link fystash.fabric.v1.ErrorFrame.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {fystash.fabric.v1.ErrorFrame.$Properties} message ErrorFrame message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ErrorFrame.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ErrorFrame message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape} ErrorFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ErrorFrame.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.ErrorFrame(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.code = value;
                                else
                                    delete message.code;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.message = value;
                                else
                                    delete message.message;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.relatedMessageId = value;
                                else
                                    delete message.relatedMessageId;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ErrorFrame message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape} ErrorFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ErrorFrame.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an ErrorFrame message.
                 * @function verify
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ErrorFrame.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                        if (!$util.isString(message.code))
                            return "code: string expected";
                    if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                        if (!$util.isString(message.message))
                            return "message: string expected";
                    if (message.relatedMessageId != null && $Object.hasOwnProperty.call(message, "relatedMessageId"))
                        if (!(message.relatedMessageId && typeof message.relatedMessageId.length === "number" || $util.isString(message.relatedMessageId)))
                            return "relatedMessageId: buffer expected";
                    return null;
                };

                /**
                 * Creates an ErrorFrame message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.ErrorFrame} ErrorFrame
                 */
                ErrorFrame.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.ErrorFrame)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.ErrorFrame: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.ErrorFrame();
                    if (object.code != null)
                        if (typeof object.code !== "string" || object.code.length)
                            message.code = $String(object.code);
                    if (object.message != null)
                        if (typeof object.message !== "string" || object.message.length)
                            message.message = $String(object.message);
                    if (object.relatedMessageId != null)
                        if (object.relatedMessageId.length)
                            if (typeof object.relatedMessageId === "string")
                                $util.base64.decode(object.relatedMessageId, message.relatedMessageId = $util.newBuffer($util.base64.length(object.relatedMessageId)), 0);
                            else if (object.relatedMessageId.length >= 0)
                                message.relatedMessageId = object.relatedMessageId;
                    return message;
                };

                /**
                 * Creates a plain object from an ErrorFrame message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {fystash.fabric.v1.ErrorFrame} message ErrorFrame
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ErrorFrame.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.code = "";
                        object.message = "";
                        if (options.bytes === $String)
                            object.relatedMessageId = "";
                        else {
                            object.relatedMessageId = [];
                            if (options.bytes !== $Array)
                                object.relatedMessageId = $util.newBuffer(object.relatedMessageId);
                        }
                    }
                    if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                        object.code = message.code;
                    if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                        object.message = message.message;
                    if (message.relatedMessageId != null && $Object.hasOwnProperty.call(message, "relatedMessageId"))
                        object.relatedMessageId = options.bytes === $String ? $util.base64.encode(message.relatedMessageId, 0, message.relatedMessageId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.relatedMessageId) : message.relatedMessageId;
                    return object;
                };

                /**
                 * Converts this ErrorFrame to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ErrorFrame.prototype.toJSON = function() {
                    return ErrorFrame.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ErrorFrame
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.ErrorFrame
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ErrorFrame.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.ErrorFrame";
                };

                return ErrorFrame;
            })();

            v1.WireFrame = (function() {

                /**
                 * Properties of a WireFrame.
                 * @typedef {Object} fystash.fabric.v1.WireFrame.$Properties
                 * @property {fystash.fabric.v1.Register.$Properties|null} [register] WireFrame register
                 * @property {fystash.fabric.v1.Envelope.$Properties|null} [envelope] WireFrame envelope
                 * @property {fystash.fabric.v1.BarrierArrive.$Properties|null} [barrierArrive] WireFrame barrierArrive
                 * @property {fystash.fabric.v1.BarrierRelease.$Properties|null} [barrierRelease] WireFrame barrierRelease
                 * @property {fystash.fabric.v1.ErrorFrame.$Properties|null} [error] WireFrame error
                 * @property {"register"|"envelope"|"barrierArrive"|"barrierRelease"|"error"} [body] WireFrame body
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a WireFrame.
                 * @memberof fystash.fabric.v1
                 * @interface IWireFrame
                 * @augments fystash.fabric.v1.WireFrame.$Properties
                 * @deprecated Use fystash.fabric.v1.WireFrame.$Properties instead.
                 */

                /**
                 * Narrowed shape of a WireFrame.
                 * @typedef {{
                 *   register?: fystash.fabric.v1.Register.$Shape|null;
                 *   envelope?: fystash.fabric.v1.Envelope.$Shape|null;
                 *   barrierArrive?: fystash.fabric.v1.BarrierArrive.$Shape|null;
                 *   barrierRelease?: fystash.fabric.v1.BarrierRelease.$Shape|null;
                 *   error?: fystash.fabric.v1.ErrorFrame.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ body?: undefined; register?: null; envelope?: null; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "register"; register: fystash.fabric.v1.Register.$Shape; envelope?: null; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "envelope"; register?: null; envelope: fystash.fabric.v1.Envelope.$Shape; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "barrierArrive"; register?: null; envelope?: null; barrierArrive: fystash.fabric.v1.BarrierArrive.$Shape; barrierRelease?: null; error?: null }|{ body?: "barrierRelease"; register?: null; envelope?: null; barrierArrive?: null; barrierRelease: fystash.fabric.v1.BarrierRelease.$Shape; error?: null }|{ body?: "error"; register?: null; envelope?: null; barrierArrive?: null; barrierRelease?: null; error: fystash.fabric.v1.ErrorFrame.$Shape })
                 * )} fystash.fabric.v1.WireFrame.$Shape
                 */

                /**
                 * Constructs a new WireFrame.
                 * @memberof fystash.fabric.v1
                 * @classdesc Represents a WireFrame.
                 * @constructor
                 * @param {fystash.fabric.v1.WireFrame.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const WireFrame = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * WireFrame register.
                 * @member {fystash.fabric.v1.Register.$Properties|null|undefined} register
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                WireFrame.prototype.register = null;

                /**
                 * WireFrame envelope.
                 * @member {fystash.fabric.v1.Envelope.$Properties|null|undefined} envelope
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                WireFrame.prototype.envelope = null;

                /**
                 * WireFrame barrierArrive.
                 * @member {fystash.fabric.v1.BarrierArrive.$Properties|null|undefined} barrierArrive
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                WireFrame.prototype.barrierArrive = null;

                /**
                 * WireFrame barrierRelease.
                 * @member {fystash.fabric.v1.BarrierRelease.$Properties|null|undefined} barrierRelease
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                WireFrame.prototype.barrierRelease = null;

                /**
                 * WireFrame error.
                 * @member {fystash.fabric.v1.ErrorFrame.$Properties|null|undefined} error
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                WireFrame.prototype.error = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * WireFrame body.
                 * @member {"register"|"envelope"|"barrierArrive"|"barrierRelease"|"error"|undefined} body
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 */
                $Object.defineProperty(WireFrame.prototype, "body", {
                    get: $util.oneOfGetter($oneOfFields = ["register", "envelope", "barrierArrive", "barrierRelease", "error"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new WireFrame instance using the specified properties.
                 * @function create
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {fystash.fabric.v1.WireFrame.$Properties=} [properties] Properties to set
                 * @returns {fystash.fabric.v1.WireFrame} WireFrame instance
                 * @type {{
                 *   (properties: fystash.fabric.v1.WireFrame.$Shape): fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape;
                 *   (properties?: fystash.fabric.v1.WireFrame.$Properties): fystash.fabric.v1.WireFrame;
                 * }}
                 */
                WireFrame.create = function(properties) {
                    return new WireFrame(properties);
                };

                /**
                 * Encodes the specified WireFrame message. Does not implicitly {@link fystash.fabric.v1.WireFrame.verify|verify} messages.
                 * @function encode
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {fystash.fabric.v1.WireFrame.$Properties} message WireFrame message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                WireFrame.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.register != null && $Object.hasOwnProperty.call(message, "register"))
                        $root.fystash.fabric.v1.Register.encode(message.register, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.envelope != null && $Object.hasOwnProperty.call(message, "envelope"))
                        $root.fystash.fabric.v1.Envelope.encode(message.envelope, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.barrierArrive != null && $Object.hasOwnProperty.call(message, "barrierArrive"))
                        $root.fystash.fabric.v1.BarrierArrive.encode(message.barrierArrive, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.barrierRelease != null && $Object.hasOwnProperty.call(message, "barrierRelease"))
                        $root.fystash.fabric.v1.BarrierRelease.encode(message.barrierRelease, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                        $root.fystash.fabric.v1.ErrorFrame.encode(message.error, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified WireFrame message, length delimited. Does not implicitly {@link fystash.fabric.v1.WireFrame.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {fystash.fabric.v1.WireFrame.$Properties} message WireFrame message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                WireFrame.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a WireFrame message from the specified reader or buffer.
                 * @function decode
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape} WireFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                WireFrame.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.fystash.fabric.v1.WireFrame();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.register = $root.fystash.fabric.v1.Register.decode(reader, reader.uint32(), $undefined, _depth + 1, message.register);
                                message.body = "register";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.envelope = $root.fystash.fabric.v1.Envelope.decode(reader, reader.uint32(), $undefined, _depth + 1, message.envelope);
                                message.body = "envelope";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.barrierArrive = $root.fystash.fabric.v1.BarrierArrive.decode(reader, reader.uint32(), $undefined, _depth + 1, message.barrierArrive);
                                message.body = "barrierArrive";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.barrierRelease = $root.fystash.fabric.v1.BarrierRelease.decode(reader, reader.uint32(), $undefined, _depth + 1, message.barrierRelease);
                                message.body = "barrierRelease";
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.error = $root.fystash.fabric.v1.ErrorFrame.decode(reader, reader.uint32(), $undefined, _depth + 1, message.error);
                                message.body = "error";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a WireFrame message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape} WireFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                WireFrame.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a WireFrame message.
                 * @function verify
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                WireFrame.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    let properties = {};
                    if (message.register != null && $Object.hasOwnProperty.call(message, "register")) {
                        properties.body = 1;
                        {
                            let error = $root.fystash.fabric.v1.Register.verify(message.register, _depth + 1);
                            if (error)
                                return "register." + error;
                        }
                    }
                    if (message.envelope != null && $Object.hasOwnProperty.call(message, "envelope")) {
                        if (properties.body === 1)
                            return "body: multiple values";
                        properties.body = 1;
                        {
                            let error = $root.fystash.fabric.v1.Envelope.verify(message.envelope, _depth + 1);
                            if (error)
                                return "envelope." + error;
                        }
                    }
                    if (message.barrierArrive != null && $Object.hasOwnProperty.call(message, "barrierArrive")) {
                        if (properties.body === 1)
                            return "body: multiple values";
                        properties.body = 1;
                        {
                            let error = $root.fystash.fabric.v1.BarrierArrive.verify(message.barrierArrive, _depth + 1);
                            if (error)
                                return "barrierArrive." + error;
                        }
                    }
                    if (message.barrierRelease != null && $Object.hasOwnProperty.call(message, "barrierRelease")) {
                        if (properties.body === 1)
                            return "body: multiple values";
                        properties.body = 1;
                        {
                            let error = $root.fystash.fabric.v1.BarrierRelease.verify(message.barrierRelease, _depth + 1);
                            if (error)
                                return "barrierRelease." + error;
                        }
                    }
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error")) {
                        if (properties.body === 1)
                            return "body: multiple values";
                        properties.body = 1;
                        {
                            let error = $root.fystash.fabric.v1.ErrorFrame.verify(message.error, _depth + 1);
                            if (error)
                                return "error." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a WireFrame message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {fystash.fabric.v1.WireFrame} WireFrame
                 */
                WireFrame.fromObject = function (object, _depth) {
                    if (object instanceof $root.fystash.fabric.v1.WireFrame)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".fystash.fabric.v1.WireFrame: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.fystash.fabric.v1.WireFrame();
                    if (object.register != null) {
                        if (!$util.isObject(object.register))
                            throw $TypeError(".fystash.fabric.v1.WireFrame.register: object expected");
                        message.register = $root.fystash.fabric.v1.Register.fromObject(object.register, _depth + 1);
                    }
                    if (object.envelope != null) {
                        if (!$util.isObject(object.envelope))
                            throw $TypeError(".fystash.fabric.v1.WireFrame.envelope: object expected");
                        message.envelope = $root.fystash.fabric.v1.Envelope.fromObject(object.envelope, _depth + 1);
                    }
                    if (object.barrierArrive != null) {
                        if (!$util.isObject(object.barrierArrive))
                            throw $TypeError(".fystash.fabric.v1.WireFrame.barrierArrive: object expected");
                        message.barrierArrive = $root.fystash.fabric.v1.BarrierArrive.fromObject(object.barrierArrive, _depth + 1);
                    }
                    if (object.barrierRelease != null) {
                        if (!$util.isObject(object.barrierRelease))
                            throw $TypeError(".fystash.fabric.v1.WireFrame.barrierRelease: object expected");
                        message.barrierRelease = $root.fystash.fabric.v1.BarrierRelease.fromObject(object.barrierRelease, _depth + 1);
                    }
                    if (object.error != null) {
                        if (!$util.isObject(object.error))
                            throw $TypeError(".fystash.fabric.v1.WireFrame.error: object expected");
                        message.error = $root.fystash.fabric.v1.ErrorFrame.fromObject(object.error, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a WireFrame message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {fystash.fabric.v1.WireFrame} message WireFrame
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                WireFrame.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.register != null && $Object.hasOwnProperty.call(message, "register")) {
                        object.register = $root.fystash.fabric.v1.Register.toObject(message.register, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "register";
                    }
                    if (message.envelope != null && $Object.hasOwnProperty.call(message, "envelope")) {
                        object.envelope = $root.fystash.fabric.v1.Envelope.toObject(message.envelope, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "envelope";
                    }
                    if (message.barrierArrive != null && $Object.hasOwnProperty.call(message, "barrierArrive")) {
                        object.barrierArrive = $root.fystash.fabric.v1.BarrierArrive.toObject(message.barrierArrive, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "barrierArrive";
                    }
                    if (message.barrierRelease != null && $Object.hasOwnProperty.call(message, "barrierRelease")) {
                        object.barrierRelease = $root.fystash.fabric.v1.BarrierRelease.toObject(message.barrierRelease, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "barrierRelease";
                    }
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error")) {
                        object.error = $root.fystash.fabric.v1.ErrorFrame.toObject(message.error, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "error";
                    }
                    return object;
                };

                /**
                 * Converts this WireFrame to JSON.
                 * @function toJSON
                 * @memberof fystash.fabric.v1.WireFrame
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                WireFrame.prototype.toJSON = function() {
                    return WireFrame.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for WireFrame
                 * @function getTypeUrl
                 * @memberof fystash.fabric.v1.WireFrame
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                WireFrame.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/fystash.fabric.v1.WireFrame";
                };

                return WireFrame;
            })();

            return v1;
        })();

        return fabric;
    })();

    return fystash;
})();

export {
  $root as default
};
