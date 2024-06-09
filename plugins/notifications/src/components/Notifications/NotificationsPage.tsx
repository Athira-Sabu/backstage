import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  HeaderLabel,
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
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="How it works">
            <Typography variant="body1">
              This plugin fetches notifications from various third-party tools
              and displays them here
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
