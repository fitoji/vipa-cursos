// next-intl type declarations matching the actual JSON structure
import "next-intl";

declare module "next-intl" {
  interface AppConfig {
    Messages: {
      layout: {
        meta: {
          title: string;
          description: string;
          ogDescription: string;
        };
      };
      HomePage: {
        meta: {
          title: string;
          description: string;
        };
      };
      Landing: {
        hero: {
          title: string;
          subtitle: string;
          cta: string;
          loggedInCta: string;
          newCourse: string;
        };
        features: {
          heading: string;
          items: {
            register: { title: string; description: string };
            history: { title: string; description: string };
            dashboard: { title: string; description: string };
            privacy: { title: string; description: string };
          };
        };
        cta: {
          title: string;
          description: string;
          button: string;
          alt: string;
        };
      };
      LoginPage: {
        meta: { title: string; description: string };
      };
      LoginForm: {
        title: string;
        mode: { signIn: string; signUp: string };
        oauth: string;
        form: {
          name: string;
          email: string;
          password: string;
          showPassword: string;
          hidePassword: string;
          submitSignIn: string;
          submitSignUp: string;
          processing: string;
        };
        errors: {
          missingFields: string;
          missingName: string;
          signInFailed: string;
          signUpFailed: string;
          sessionNotReady: string;
          googleFailed: string;
          unexpected: string;
        };
        success: { signedIn: string };
      };
      DashboardPage: { meta: { title: string; description: string } };
      Dashboard: {
        header: {
          title: string;
          coursesCount: string;
          newCourse: string;
          back: string;
          loading: string;
        };
        stats: {
          totalCourses: string;
          daysSitting: string;
          daysServing: string;
          countriesVisited: string;
          coursesSitting10d: string;
          coursesServing10d: string;
          longServing20d: string;
          longCourses20d: string;
          modeBreakdown: string;
          recentCourses: string;
          noCourses: string;
          countriesDialogTitle: string;
          noCountries: string;
          sit: string;
          serve: string;
          courseSingular: string;
          coursePlural: string;
        };
        table: {
          header: {
            date: string;
            place: string;
            teacher: string;
            country: string;
            mode: string;
            days: string;
            obs: string;
            actions: string;
          };
          notSpecified: string;
          noTeacher: string;
          daysLabel: string;
          searchPlaceholder: string;
          noResults: string;
          deleteDialog: {
            title: string;
            description: string;
            cancel: string;
            delete: string;
            deleting: string;
          };
          filterBadge: string;
          courseSingular: string;
          coursePlural: string;
        };
        empty: {
          title: string;
          description: string;
          addCourse: string;
          excelTip: string;
          excelTipDesc: string;
          copy: string;
          copied: string;
        };
        sidebar: {
          stats: string;
          allCourses: string;
          centers: string;
          download: string;
          downloading: string;
          noData: string;
          import: string;
          back: string;
        };
        toast: {
          deleted: string;
          deleteError: string;
          downloadSuccess: string;
          downloadError: string;
          noData: string;
        };
        edit: {
          dialogTitle: string;
          save: string;
          saving: string;
          cancel: string;
          success: string;
          error: string;
          labels: {
            date: string;
            place: string;
            teacher: string;
            country: string;
            mode: string;
            days: string;
            obs: string;
            sit: string;
            serve: string;
          };
        };
        filters: {
          activeFilters: string;
          clear: string;
          presets: {
            modeSit: string;
            modeServe: string;
            sit10d: string;
            serve10d: string;
            longServe20d: string;
            longCourses20d: string;
          };
        };
        modeBreakdown: { courses: string };
        recent: { dateFormat: string; noTeacher: string };
      };
      CursosPage: {
        title: string;
        subtitle: string;
        dashboardLink: string;
        formTitle: string;
        labels: {
          startDate: string;
          place: string;
          placePlaceholder: string;
          teacher: string;
          teacherPlaceholder: string;
          country: string;
          countryPlaceholder: string;
          mode: string;
          modeSit: string;
          modeServe: string;
          days: string;
          daysPlaceholder: string;
          daysCustomSit: string;
          daysCustomServe: string;
          obs: string;
          obsPlaceholder: string;
        };
        days: { other: string; lts: string; label: string; labelWithName: string };
        submit: { save: string; saving: string; saved: string };
        toast: { saved: string; saveError: string };
      };
      ImportCourses: {
        pageTitle: string;
        pageDescription: string;
        dialogTitle: string;
        dialogDescription: string;
        dropzone: { dragLabel: string; clickLabel: string; ariaLabel: string; dragActive: string };
        textareaPlaceholder: string;
        format: {
          title: string;
          required: string;
          modeInfo: string;
          daysInfo: string;
          optional: string;
          unknownTip: string;
          modeValues: string;
        };
        table: {
          header: {
            date: string;
            place: string;
            mode: string;
            days: string;
            teacher: string;
            country: string;
          };
        };
        preview: { summary: string; errorTitle: string; rowError: string };
        errors: {
          invalidJson: string;
          notArray: string;
          fileTooLarge: string;
          mustBeJson: string;
          validationTitle: string;
        };
        buttons: {
          clear: string;
          import: string;
          importCount: string;
          importing: string;
          cancel: string;
        };
        toast: { imported: string; importError: string };
      };
      SiteHeader: {
        themeLabel: string;
        userMenu: string;
        signOut: string;
        signIn: string;
        signUp: string;
      };
      SiteFooter: { copyright: string; tagline: string };
      ErrorPage: { title: string; message: string; retry: string; goHome: string };
      NotFoundPage: { code: string; title: string; message: string; goHome: string };
      LocationsExplorer: {
        continentLabel: string;
        allContinents: string;
        searchPlaceholder: string;
        countrySelectPlaceholder: string;
        allCountries: string;
        typeSelectPlaceholder: string;
        allTypes: string;
        typeCenter: string;
        typeNonCentre: string;
        activeFilters: string;
        clearFilters: string;
        noResults: string;
        table: {
          header: {
            name: string;
            type: string;
            country: string;
            city: string;
            state: string;
            continent: string;
          };
        };
        pagination: { resultCount: string; pageInfo: string; notSpecified: string };
      };
      common: {
        notSpecified: string;
        noResults: string;
        cancel: string;
        save: string;
        delete: string;
        loading: string;
        copy: string;
        copied: string;
        courseSingular: string;
        coursePlural: string;
        mustBeJson: string;
        invalidJson: string;
        validationTitle: string;
        locale: string;
      };
    };
  }
}
