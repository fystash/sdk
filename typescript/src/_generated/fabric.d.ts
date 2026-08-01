import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace fystash. */
export namespace fystash {

    /** Namespace fabric. */
    namespace fabric {

        /** Namespace v1. */
        namespace v1 {

            /** MessageKind enum. */
            enum MessageKind {

                /** MESSAGE_KIND_UNSPECIFIED value */
                MESSAGE_KIND_UNSPECIFIED = 0,

                /** MESSAGE_KIND_REQUEST value */
                MESSAGE_KIND_REQUEST = 1,

                /** MESSAGE_KIND_RESPONSE value */
                MESSAGE_KIND_RESPONSE = 2,

                /** MESSAGE_KIND_EVENT value */
                MESSAGE_KIND_EVENT = 3,

                /** MESSAGE_KIND_ACK value */
                MESSAGE_KIND_ACK = 4,

                /** MESSAGE_KIND_CANCEL value */
                MESSAGE_KIND_CANCEL = 5,

                /** MESSAGE_KIND_ERROR value */
                MESSAGE_KIND_ERROR = 6
            }

            /**
             * Properties of a Register.
             * @deprecated Use fystash.fabric.v1.Register.$Properties instead.
             */
            interface IRegister extends fystash.fabric.v1.Register.$Properties {
            }

            /** Represents a Register. */
            class Register {

                /**
                 * Constructs a new Register.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.Register.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Register protocolVersion. */
                protocolVersion: number;

                /** Register roomId. */
                roomId: string;

                /** Register agentId. */
                agentId: string;

                /** Register sessionToken. */
                sessionToken: Uint8Array;

                /** Register subscriptions. */
                subscriptions: string[];

                /**
                 * Creates a new Register instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Register instance
                 */
                static create(properties: fystash.fabric.v1.Register.$Shape): fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape;
                static create(properties?: fystash.fabric.v1.Register.$Properties): fystash.fabric.v1.Register;

                /**
                 * Encodes the specified Register message. Does not implicitly {@link fystash.fabric.v1.Register.verify|verify} messages.
                 * @param message Register message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.Register.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Register message, length delimited. Does not implicitly {@link fystash.fabric.v1.Register.verify|verify} messages.
                 * @param message Register message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.Register.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Register message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape} Register
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape;

                /**
                 * Decodes a Register message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape} Register
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.Register & fystash.fabric.v1.Register.$Shape;

                /**
                 * Verifies a Register message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Register message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Register
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.Register;

                /**
                 * Creates a plain object from a Register message. Also converts values to other types if specified.
                 * @param message Register
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.Register, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Register to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Register
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Register {

                /** Properties of a Register. */
                interface $Properties {

                    /** Register protocolVersion */
                    protocolVersion?: (number|null);

                    /** Register roomId */
                    roomId?: (string|null);

                    /** Register agentId */
                    agentId?: (string|null);

                    /** Register sessionToken */
                    sessionToken?: (Uint8Array|null);

                    /** Register subscriptions */
                    subscriptions?: (string[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Register. */
                type $Shape = fystash.fabric.v1.Register.$Properties;
            }

            /**
             * Properties of an Envelope.
             * @deprecated Use fystash.fabric.v1.Envelope.$Properties instead.
             */
            interface IEnvelope extends fystash.fabric.v1.Envelope.$Properties {
            }

            /** Represents an Envelope. */
            class Envelope {

                /**
                 * Constructs a new Envelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.Envelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Envelope protocolVersion. */
                protocolVersion: number;

                /** Envelope messageId. */
                messageId: Uint8Array;

                /** Envelope roomId. */
                roomId: string;

                /** Envelope source. */
                source: string;

                /** Envelope destination. */
                destination: string;

                /** Envelope kind. */
                kind: fystash.fabric.v1.MessageKind;

                /** Envelope streamId. */
                streamId: (number|Long);

                /** Envelope sequence. */
                sequence: (number|Long);

                /** Envelope deadlineUnixMs. */
                deadlineUnixMs: (number|Long);

                /** Envelope headers. */
                headers: { [k: string]: string };

                /** Envelope payload. */
                payload: Uint8Array;

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Envelope instance
                 */
                static create(properties: fystash.fabric.v1.Envelope.$Shape): fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape;
                static create(properties?: fystash.fabric.v1.Envelope.$Properties): fystash.fabric.v1.Envelope;

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link fystash.fabric.v1.Envelope.verify|verify} messages.
                 * @param message Envelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.Envelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Envelope message, length delimited. Does not implicitly {@link fystash.fabric.v1.Envelope.verify|verify} messages.
                 * @param message Envelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.Envelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape;

                /**
                 * Decodes an Envelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.Envelope & fystash.fabric.v1.Envelope.$Shape;

                /**
                 * Verifies an Envelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Envelope
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.Envelope;

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @param message Envelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Envelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Envelope
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Envelope {

                /** Properties of an Envelope. */
                interface $Properties {

                    /** Envelope protocolVersion */
                    protocolVersion?: (number|null);

                    /** Envelope messageId */
                    messageId?: (Uint8Array|null);

                    /** Envelope roomId */
                    roomId?: (string|null);

                    /** Envelope source */
                    source?: (string|null);

                    /** Envelope destination */
                    destination?: (string|null);

                    /** Envelope kind */
                    kind?: (fystash.fabric.v1.MessageKind|null);

                    /** Envelope streamId */
                    streamId?: (number|Long|null);

                    /** Envelope sequence */
                    sequence?: (number|Long|null);

                    /** Envelope deadlineUnixMs */
                    deadlineUnixMs?: (number|Long|null);

                    /** Envelope headers */
                    headers?: ({ [k: string]: string }|null);

                    /** Envelope payload */
                    payload?: (Uint8Array|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an Envelope. */
                type $Shape = fystash.fabric.v1.Envelope.$Properties;
            }

            /**
             * Properties of a BarrierArrive.
             * @deprecated Use fystash.fabric.v1.BarrierArrive.$Properties instead.
             */
            interface IBarrierArrive extends fystash.fabric.v1.BarrierArrive.$Properties {
            }

            /** Represents a BarrierArrive. */
            class BarrierArrive {

                /**
                 * Constructs a new BarrierArrive.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.BarrierArrive.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** BarrierArrive roomId. */
                roomId: string;

                /** BarrierArrive barrierId. */
                barrierId: string;

                /** BarrierArrive parties. */
                parties: number;

                /**
                 * Creates a new BarrierArrive instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns BarrierArrive instance
                 */
                static create(properties: fystash.fabric.v1.BarrierArrive.$Shape): fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape;
                static create(properties?: fystash.fabric.v1.BarrierArrive.$Properties): fystash.fabric.v1.BarrierArrive;

                /**
                 * Encodes the specified BarrierArrive message. Does not implicitly {@link fystash.fabric.v1.BarrierArrive.verify|verify} messages.
                 * @param message BarrierArrive message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.BarrierArrive.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified BarrierArrive message, length delimited. Does not implicitly {@link fystash.fabric.v1.BarrierArrive.verify|verify} messages.
                 * @param message BarrierArrive message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.BarrierArrive.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a BarrierArrive message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape} BarrierArrive
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape;

                /**
                 * Decodes a BarrierArrive message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape} BarrierArrive
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.BarrierArrive & fystash.fabric.v1.BarrierArrive.$Shape;

                /**
                 * Verifies a BarrierArrive message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a BarrierArrive message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns BarrierArrive
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.BarrierArrive;

                /**
                 * Creates a plain object from a BarrierArrive message. Also converts values to other types if specified.
                 * @param message BarrierArrive
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.BarrierArrive, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this BarrierArrive to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for BarrierArrive
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace BarrierArrive {

                /** Properties of a BarrierArrive. */
                interface $Properties {

                    /** BarrierArrive roomId */
                    roomId?: (string|null);

                    /** BarrierArrive barrierId */
                    barrierId?: (string|null);

                    /** BarrierArrive parties */
                    parties?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a BarrierArrive. */
                type $Shape = fystash.fabric.v1.BarrierArrive.$Properties;
            }

            /**
             * Properties of a BarrierRelease.
             * @deprecated Use fystash.fabric.v1.BarrierRelease.$Properties instead.
             */
            interface IBarrierRelease extends fystash.fabric.v1.BarrierRelease.$Properties {
            }

            /** Represents a BarrierRelease. */
            class BarrierRelease {

                /**
                 * Constructs a new BarrierRelease.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.BarrierRelease.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** BarrierRelease roomId. */
                roomId: string;

                /** BarrierRelease barrierId. */
                barrierId: string;

                /** BarrierRelease participants. */
                participants: string[];

                /**
                 * Creates a new BarrierRelease instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns BarrierRelease instance
                 */
                static create(properties: fystash.fabric.v1.BarrierRelease.$Shape): fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape;
                static create(properties?: fystash.fabric.v1.BarrierRelease.$Properties): fystash.fabric.v1.BarrierRelease;

                /**
                 * Encodes the specified BarrierRelease message. Does not implicitly {@link fystash.fabric.v1.BarrierRelease.verify|verify} messages.
                 * @param message BarrierRelease message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.BarrierRelease.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified BarrierRelease message, length delimited. Does not implicitly {@link fystash.fabric.v1.BarrierRelease.verify|verify} messages.
                 * @param message BarrierRelease message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.BarrierRelease.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a BarrierRelease message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape} BarrierRelease
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape;

                /**
                 * Decodes a BarrierRelease message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape} BarrierRelease
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.BarrierRelease & fystash.fabric.v1.BarrierRelease.$Shape;

                /**
                 * Verifies a BarrierRelease message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a BarrierRelease message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns BarrierRelease
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.BarrierRelease;

                /**
                 * Creates a plain object from a BarrierRelease message. Also converts values to other types if specified.
                 * @param message BarrierRelease
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.BarrierRelease, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this BarrierRelease to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for BarrierRelease
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace BarrierRelease {

                /** Properties of a BarrierRelease. */
                interface $Properties {

                    /** BarrierRelease roomId */
                    roomId?: (string|null);

                    /** BarrierRelease barrierId */
                    barrierId?: (string|null);

                    /** BarrierRelease participants */
                    participants?: (string[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a BarrierRelease. */
                type $Shape = fystash.fabric.v1.BarrierRelease.$Properties;
            }

            /**
             * Properties of an ArtifactRef.
             * @deprecated Use fystash.fabric.v1.ArtifactRef.$Properties instead.
             */
            interface IArtifactRef extends fystash.fabric.v1.ArtifactRef.$Properties {
            }

            /** Represents an ArtifactRef. */
            class ArtifactRef {

                /**
                 * Constructs a new ArtifactRef.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.ArtifactRef.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ArtifactRef artifactId. */
                artifactId: string;

                /** ArtifactRef path. */
                path: string;

                /** ArtifactRef sha256. */
                sha256: Uint8Array;

                /** ArtifactRef size. */
                size: (number|Long);

                /** ArtifactRef mediaType. */
                mediaType: string;

                /**
                 * Creates a new ArtifactRef instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ArtifactRef instance
                 */
                static create(properties: fystash.fabric.v1.ArtifactRef.$Shape): fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape;
                static create(properties?: fystash.fabric.v1.ArtifactRef.$Properties): fystash.fabric.v1.ArtifactRef;

                /**
                 * Encodes the specified ArtifactRef message. Does not implicitly {@link fystash.fabric.v1.ArtifactRef.verify|verify} messages.
                 * @param message ArtifactRef message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.ArtifactRef.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ArtifactRef message, length delimited. Does not implicitly {@link fystash.fabric.v1.ArtifactRef.verify|verify} messages.
                 * @param message ArtifactRef message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.ArtifactRef.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ArtifactRef message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape} ArtifactRef
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape;

                /**
                 * Decodes an ArtifactRef message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape} ArtifactRef
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.ArtifactRef & fystash.fabric.v1.ArtifactRef.$Shape;

                /**
                 * Verifies an ArtifactRef message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ArtifactRef message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ArtifactRef
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.ArtifactRef;

                /**
                 * Creates a plain object from an ArtifactRef message. Also converts values to other types if specified.
                 * @param message ArtifactRef
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.ArtifactRef, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ArtifactRef to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ArtifactRef
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ArtifactRef {

                /** Properties of an ArtifactRef. */
                interface $Properties {

                    /** ArtifactRef artifactId */
                    artifactId?: (string|null);

                    /** ArtifactRef path */
                    path?: (string|null);

                    /** ArtifactRef sha256 */
                    sha256?: (Uint8Array|null);

                    /** ArtifactRef size */
                    size?: (number|Long|null);

                    /** ArtifactRef mediaType */
                    mediaType?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ArtifactRef. */
                type $Shape = fystash.fabric.v1.ArtifactRef.$Properties;
            }

            /**
             * Properties of an ErrorFrame.
             * @deprecated Use fystash.fabric.v1.ErrorFrame.$Properties instead.
             */
            interface IErrorFrame extends fystash.fabric.v1.ErrorFrame.$Properties {
            }

            /** Represents an ErrorFrame. */
            class ErrorFrame {

                /**
                 * Constructs a new ErrorFrame.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.ErrorFrame.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ErrorFrame code. */
                code: string;

                /** ErrorFrame message. */
                message: string;

                /** ErrorFrame relatedMessageId. */
                relatedMessageId: Uint8Array;

                /**
                 * Creates a new ErrorFrame instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ErrorFrame instance
                 */
                static create(properties: fystash.fabric.v1.ErrorFrame.$Shape): fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape;
                static create(properties?: fystash.fabric.v1.ErrorFrame.$Properties): fystash.fabric.v1.ErrorFrame;

                /**
                 * Encodes the specified ErrorFrame message. Does not implicitly {@link fystash.fabric.v1.ErrorFrame.verify|verify} messages.
                 * @param message ErrorFrame message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.ErrorFrame.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ErrorFrame message, length delimited. Does not implicitly {@link fystash.fabric.v1.ErrorFrame.verify|verify} messages.
                 * @param message ErrorFrame message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.ErrorFrame.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ErrorFrame message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape} ErrorFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape;

                /**
                 * Decodes an ErrorFrame message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape} ErrorFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.ErrorFrame & fystash.fabric.v1.ErrorFrame.$Shape;

                /**
                 * Verifies an ErrorFrame message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ErrorFrame message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ErrorFrame
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.ErrorFrame;

                /**
                 * Creates a plain object from an ErrorFrame message. Also converts values to other types if specified.
                 * @param message ErrorFrame
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.ErrorFrame, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ErrorFrame to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ErrorFrame
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ErrorFrame {

                /** Properties of an ErrorFrame. */
                interface $Properties {

                    /** ErrorFrame code */
                    code?: (string|null);

                    /** ErrorFrame message */
                    message?: (string|null);

                    /** ErrorFrame relatedMessageId */
                    relatedMessageId?: (Uint8Array|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ErrorFrame. */
                type $Shape = fystash.fabric.v1.ErrorFrame.$Properties;
            }

            /**
             * Properties of a WireFrame.
             * @deprecated Use fystash.fabric.v1.WireFrame.$Properties instead.
             */
            interface IWireFrame extends fystash.fabric.v1.WireFrame.$Properties {
            }

            /** Represents a WireFrame. */
            class WireFrame {

                /**
                 * Constructs a new WireFrame.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: fystash.fabric.v1.WireFrame.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** WireFrame register. */
                register?: (fystash.fabric.v1.Register.$Properties|null);

                /** WireFrame envelope. */
                envelope?: (fystash.fabric.v1.Envelope.$Properties|null);

                /** WireFrame barrierArrive. */
                barrierArrive?: (fystash.fabric.v1.BarrierArrive.$Properties|null);

                /** WireFrame barrierRelease. */
                barrierRelease?: (fystash.fabric.v1.BarrierRelease.$Properties|null);

                /** WireFrame error. */
                error?: (fystash.fabric.v1.ErrorFrame.$Properties|null);

                /** WireFrame body. */
                body?: ("register"|"envelope"|"barrierArrive"|"barrierRelease"|"error");

                /**
                 * Creates a new WireFrame instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns WireFrame instance
                 */
                static create(properties: fystash.fabric.v1.WireFrame.$Shape): fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape;
                static create(properties?: fystash.fabric.v1.WireFrame.$Properties): fystash.fabric.v1.WireFrame;

                /**
                 * Encodes the specified WireFrame message. Does not implicitly {@link fystash.fabric.v1.WireFrame.verify|verify} messages.
                 * @param message WireFrame message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: fystash.fabric.v1.WireFrame.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified WireFrame message, length delimited. Does not implicitly {@link fystash.fabric.v1.WireFrame.verify|verify} messages.
                 * @param message WireFrame message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: fystash.fabric.v1.WireFrame.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a WireFrame message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape} WireFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape;

                /**
                 * Decodes a WireFrame message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape} WireFrame
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fystash.fabric.v1.WireFrame & fystash.fabric.v1.WireFrame.$Shape;

                /**
                 * Verifies a WireFrame message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a WireFrame message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns WireFrame
                 */
                static fromObject(object: { [k: string]: any }): fystash.fabric.v1.WireFrame;

                /**
                 * Creates a plain object from a WireFrame message. Also converts values to other types if specified.
                 * @param message WireFrame
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: fystash.fabric.v1.WireFrame, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this WireFrame to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for WireFrame
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace WireFrame {

                /** Properties of a WireFrame. */
                interface $Properties {

                    /** WireFrame register */
                    register?: (fystash.fabric.v1.Register.$Properties|null);

                    /** WireFrame envelope */
                    envelope?: (fystash.fabric.v1.Envelope.$Properties|null);

                    /** WireFrame barrierArrive */
                    barrierArrive?: (fystash.fabric.v1.BarrierArrive.$Properties|null);

                    /** WireFrame barrierRelease */
                    barrierRelease?: (fystash.fabric.v1.BarrierRelease.$Properties|null);

                    /** WireFrame error */
                    error?: (fystash.fabric.v1.ErrorFrame.$Properties|null);

                    /** WireFrame body */
                    body?: ("register"|"envelope"|"barrierArrive"|"barrierRelease"|"error");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a WireFrame. */
                type $Shape = {
                  register?: fystash.fabric.v1.Register.$Shape|null;
                  envelope?: fystash.fabric.v1.Envelope.$Shape|null;
                  barrierArrive?: fystash.fabric.v1.BarrierArrive.$Shape|null;
                  barrierRelease?: fystash.fabric.v1.BarrierRelease.$Shape|null;
                  error?: fystash.fabric.v1.ErrorFrame.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ body?: undefined; register?: null; envelope?: null; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "register"; register: fystash.fabric.v1.Register.$Shape; envelope?: null; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "envelope"; register?: null; envelope: fystash.fabric.v1.Envelope.$Shape; barrierArrive?: null; barrierRelease?: null; error?: null }|{ body?: "barrierArrive"; register?: null; envelope?: null; barrierArrive: fystash.fabric.v1.BarrierArrive.$Shape; barrierRelease?: null; error?: null }|{ body?: "barrierRelease"; register?: null; envelope?: null; barrierArrive?: null; barrierRelease: fystash.fabric.v1.BarrierRelease.$Shape; error?: null }|{ body?: "error"; register?: null; envelope?: null; barrierArrive?: null; barrierRelease?: null; error: fystash.fabric.v1.ErrorFrame.$Shape })
                );
            }
        }
    }
}
