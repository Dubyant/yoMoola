import type { FC } from 'react';
import { useMemo } from 'react';

import B from 'bignumber.js';
import { useIntl } from 'react-intl';
import { useWindowDimensions } from 'react-native';

import { HStack, Image, VStack } from '@onekeyhq/components';
import type { NFTAsset } from '@onekeyhq/engine/src/types/nft';
import down from '@onekeyhq/kit/assets/annual/down.png';
import up from '@onekeyhq/kit/assets/annual/up.png';

import { PriceString, floorPriceSymbolMap } from '../../NFTMarket/PriceText';
import NFTListImage from '../../Wallet/NFT/NFTList/NFTListImage';
import { WText } from '../components';

import type { PageProps } from '../types';

const NftPNL: FC<PageProps> = ({ params: { pnls, networkId } }) => {
  const { data, assets } = pnls ?? {};
  const intl = useIntl();
  const { height } = useWindowDimensions();

  const total = useMemo(() => {
    let totalValue = '0';
    if (data?.totalProfit) {
      totalValue = data?.totalProfit?.decimalPlaces(3).toString();
      totalValue = `${
        data?.totalProfit?.toNumber() >= 0 ? '+' : ''
      }${totalValue}`;
    }
    return PriceString({
      price: totalValue,
      networkId,
      symbol: `\n${floorPriceSymbolMap[networkId ?? '']}`,
    });
  }, [data, networkId]);

  const items = useMemo(() => {
    const list = (
      data?.content.map((n) => {
        const key = `${n.contractAddress as string}-${n.tokenId}`;
        return {
          ...n,
          key,
          asset: assets?.[key],
        };
      }) ?? []
    ).filter((n) => !!n.asset);

    if (height > 800) {
      return list;
    }
    return list.slice(0, 3);
  }, [data, assets, height]);

  if (!items?.length) {
    return (
      <>
        <WText
          fontWeight="600"
          fontSize="32px"
          color="#E2E2E8"
          mb="2"
          lineHeight="45px"
        >
          {intl.formatMessage({
            id: 'content__you_have_not_made_any_nft_transactions',
          })}
        </WText>
        <WText
          fontWeight="600"
          fontSize="24px"
          lineHeight="34px"
          color="#E2E2E8"
          mb="2"
          mt="6"
        >
          {intl.formatMessage({
            id: 'content__you_have_not_made_any_nft_transactions_desc',
          })}
        </WText>
      </>
    );
  }

  return (
    <>
      <WText
        fontWeight="600"
        fontSize="32px"
        color="#E2E2E8"
        mb="2"
        lineHeight="45px"
      >
        {intl.formatMessage({
          id: 'content__you_who_love_nft_the_most_have_also_gained_a_lot_this_year',
        })}
      </WText>
      <HStack mt="6">
        <VStack flex="1">
          <WText
            fontWeight="800"
            fontSize="20px"
            lineHeight="28px"
            color="#E2E2E8"
            mb="2"
          >
            {intl.formatMessage({ id: 'content__spent' })}
          </WText>
          <WText
            fontWeight="bold"
            fontSize="24px"
            lineHeight="29px"
            color="#E2E2E8"
            mb="2"
            useCustomFont
          >
            {PriceString({
              networkId,
              price: data?.spend?.decimalPlaces(3).toString() ?? '',
              symbol: `\n${floorPriceSymbolMap[networkId ?? '']}`,
            })}
          </WText>
        </VStack>
        <VStack flex="1">
          <WText
            fontWeight="800"
            fontSize="20px"
            lineHeight="28px"
            color="#E2E2E8"
            mb="2"
          >
            {intl.formatMessage({ id: 'content__profit' })}
          </WText>
          <WText
            fontWeight="bold"
            fontSize="24px"
            lineHeight="29px"
            color="#E2E2E8"
            mb="6"
            useCustomFont
          >
            {total}
          </WText>
        </VStack>
      </HStack>
      {items.map((item) => (
        <HStack alignItems="center" mb="6px" key={item.key}>
          <NFTListImage asset={item.asset || ({} as NFTAsset)} size={80} />
          <VStack ml="6" flex="1">
            <WText
              fontWeight="600"
              fontSize="20px"
              lineHeight="28px"
              color="#E2E2E8"
              numberOfLines={1}
              mb="10px"
            >
              {`${item.contractName ?? ''}  #${item.tokenId ?? ''}`}
            </WText>
            <HStack alignItems="center">
              <Image w="10px" h="6px" source={item.profit < 0 ? down : up} />
              <WText
                fontWeight="600"
                fontSize="20px"
                lineHeight="28px"
                color={item.profit < 0 ? '#FF6259' : '#34C759'}
                flex="1"
                numberOfLines={1}
                useCustomFont
                ml="1"
              >
                {PriceString({
                  price:
                    new B(item?.profit || 0).decimalPlaces(3).toString() ?? '',
                  networkId,
                })}
              </WText>
            </HStack>
          </VStack>
        </HStack>
      ))}
    </>
  );
};

export default NftPNL;
