import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { NotificationsPanel } from './NotificationsPanel';

export const NotificationsPage = () => (
  <Page themeId="tool">
    <Header
      title="Notifications!"
      subtitle="Get notifications from Jira, Confluence, GitLab, and more in one place"
    >
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Notifications Overview">
        <SupportButton>
          Manage and view all your tool notifications from this plugin.
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="How it works">
            <Typography variant="body1">
              This plugin fetches notifications from various third-party tools
              and displays them in a unified interface. You can customize which
              tools to fetch notifications from in the settings.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item>
          <NotificationsPanel />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
