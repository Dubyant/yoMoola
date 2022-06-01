/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { FC, useMemo } from 'react';

import { useIntl } from 'react-intl';

import {
  HStack,
  Image,
  Text,
  Typography,
  VStack,
  useThemeValue,
} from '@onekeyhq/components';
import {
  MaterialTabBar,
  Tabs,
} from '@onekeyhq/components/src/CollapsibleTabView';
import { FormErrorMessage } from '@onekeyhq/components/src/Form/FormErrorMessage';
import { Body2StrongProps } from '@onekeyhq/components/src/Typography';
import { ETHMessageTypes } from '@onekeyhq/engine/src/types/message';
import { IUnsignedMessageEvm } from '@onekeyhq/engine/src/vaults/impl/evm/Vault';
import X from '@onekeyhq/kit/assets/red_x.png';

import { IDappCallParams } from '../../background/IBackgroundApi';
import { useActiveWalletAccount } from '../../hooks/redux';

import ConfirmHeader from './ConfirmHeader';

import type { TextStyle } from 'react-native';

type TypedDataV1 = {
  type: string;
  name: string;
  value: string;
};

const getSignTypeString = (signType: ETHMessageTypes) => {
  const signTypeMap = {
    [ETHMessageTypes.ETH_SIGN]: 'eth_sign',
    [ETHMessageTypes.PERSONAL_SIGN]: 'personal_sign',
    [ETHMessageTypes.TYPED_DATA_V1]: 'signTypedData_v1',
    [ETHMessageTypes.TYPED_DATA_V3]: 'signTypedData_v3',
    [ETHMessageTypes.TYPED_DATA_V4]: 'signTypedData_v4',
  } as const;
  return signTypeMap[signType];
};

const renderCard = (text: string) => (
  <VStack bg="surface-default" borderRadius="12px" mt="4">
    <HStack justifyContent="space-between" space="16px" padding="16px">
      <Text
        typography={{ sm: 'Caption', md: 'Caption' }}
        color="text-subdued"
        flex={1}
        overflowWrap="anywhere"
      >
        {text || '-'}
      </Text>
    </HStack>
  </VStack>
);

// Render readable message recursively.
const renderMessage = (json: any, padding = 0) => {
  if (!json) {
    return <Typography.Body2>{'null\n'}</Typography.Body2>;
  }

  if (typeof json === 'boolean') {
    return (
      <Typography.Body2>{`${json ? 'true' : 'false'}\n`}</Typography.Body2>
    );
  }

  if (typeof json === 'string' || typeof json === 'number') {
    return (
      <Typography.Body2 wordBreak="break-all" whiteSpace="pre-wrap">
        {json}
        {'\n'}
      </Typography.Body2>
    );
  }

  const siblings = Object.keys(json).map((key) => (
    <Typography.Body2 pl={padding} color="text-subdued">
      {`${key}: `}
      {renderMessage(json[key], padding + 4)}
    </Typography.Body2>
  ));

  return (
    <Typography.Body2>
      {padding ? '\n' : ''}
      {siblings}
    </Typography.Body2>
  );
};

const renderMessageCard = (unsignedMessage: IUnsignedMessageEvm) => {
  const { message, type } = unsignedMessage;

  if (type === ETHMessageTypes.PERSONAL_SIGN) {
    const hex = message.replace('0x', '');
    const personalSignMsg = Buffer.from(hex, 'hex').toString('utf-8');
    return renderCard(personalSignMsg);
  }

  let messageObject = JSON.parse(message) ?? {};
  messageObject = messageObject.message ?? messageObject;

  if (type === ETHMessageTypes.TYPED_DATA_V1 && Array.isArray(messageObject)) {
    const v1Message: TypedDataV1[] = messageObject;
    messageObject = v1Message.reduce((acc, cur) => {
      acc[cur.name] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }

  return (
    <VStack bg="surface-default" borderRadius="12px" mt="4">
      <HStack justifyContent="space-between" space="16px" padding="16px">
        <Text flex={1} overflowWrap="anywhere">
          {renderMessage(messageObject)}
        </Text>
      </HStack>
    </VStack>
  );
};

const renderDataCard = (unsignedMessage: IUnsignedMessageEvm) => {
  const { message, type } = unsignedMessage;

  if (type === ETHMessageTypes.PERSONAL_SIGN) {
    return renderCard(message);
  }

  let formattedJson = '';
  try {
    formattedJson = JSON.stringify(JSON.parse(message), null, 4);
  } catch (e) {
    console.error(e);
  }
  return renderCard(formattedJson);
};

const SignDetail: FC<{
  unsignedMessage: IUnsignedMessageEvm;
  sourceInfo?: IDappCallParams;
}> = ({ unsignedMessage, sourceInfo }) => {
  const intl = useIntl();
  const { accountId } = useActiveWalletAccount();
  const { type, message } = unsignedMessage;
  const [
    tabbarBgColor,
    activeLabelColor,
    labelColor,
    indicatorColor,
    borderDefault,
  ] = useThemeValue([
    'background-default',
    'text-default',
    'text-subdued',
    'action-primary-default',
    'border-subdued',
  ]);

  const isWatchingAccount = useMemo(
    () => accountId && accountId.startsWith('watching-'),
    [accountId],
  );

  const header = useMemo(
    () => (
      <ConfirmHeader
        title={intl.formatMessage({
          id: 'title__signature_request',
        })}
        origin={sourceInfo?.origin}
      />
    ),
    [intl, sourceInfo?.origin],
  );

  const warning = useMemo(
    () => (
      <VStack
        bg="surface-critical-subdued"
        borderColor="border-critical-subdued"
        borderRadius="12px"
        borderWidth={1}
      >
        <HStack justifyContent="space-between" space="16px" padding="16px">
          <Image size="20px" source={X} />
          <Typography.Body2>
            {intl.formatMessage({
              id: 'msg__signing_this_message_can_be_dangerous_Only_sign_this_message_if_you_fully_trust_this_site_and_understand_the_potential_risks',
            })}
          </Typography.Body2>
        </HStack>
      </VStack>
    ),
    [intl],
  );

  return type === ETHMessageTypes.ETH_SIGN ? (
    <>
      {header}
      {warning}
      <Typography.Subheading mt="24px" color="text-subdued">
        {intl.formatMessage({ id: 'form__message_tab' })}
      </Typography.Subheading>
      {renderCard(message)}
    </>
  ) : (
    <Tabs.Container
      renderHeader={() => header}
      pagerProps={{ scrollEnabled: false }}
      headerHeight={180}
      containerStyle={{
        width: '100%',
        marginHorizontal: 'auto',
        backgroundColor: 'transparent',
      }}
      headerContainerStyle={{
        shadowOffset: { width: 0, height: 0 },
        shadowColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: borderDefault,
      }}
      renderTabBar={(props) => (
        <MaterialTabBar
          {...props}
          activeColor={activeLabelColor}
          inactiveColor={labelColor}
          labelStyle={{
            ...(Body2StrongProps as TextStyle),
          }}
          indicatorStyle={{ backgroundColor: indicatorColor }}
          style={{
            backgroundColor: tabbarBgColor,
          }}
          tabStyle={{ backgroundColor: tabbarBgColor }}
        />
      )}
    >
      <Tabs.Tab
        name="Message"
        label={intl.formatMessage({
          id: 'form__message_tab',
        })}
      >
        {renderMessageCard(unsignedMessage)}
        {isWatchingAccount ? (
          <FormErrorMessage
            message={intl.formatMessage({
              id: 'form__error_trade_with_watched_acocunt' as any,
            })}
          />
        ) : null}
      </Tabs.Tab>
      <Tabs.Tab
        name="Data"
        label={intl.formatMessage({
          id: 'form__data_tab',
        })}
      >
        <VStack flex="1">
          {renderDataCard(unsignedMessage)}

          <Typography.Subheading mt="24px" color="text-subdued">
            {intl.formatMessage({ id: 'form__method_type_uppercase' as any })}
          </Typography.Subheading>
          <Typography.Body2 mt="6px">
            {getSignTypeString(type)}
          </Typography.Body2>
        </VStack>
      </Tabs.Tab>
    </Tabs.Container>
  );
};

export default SignDetail;